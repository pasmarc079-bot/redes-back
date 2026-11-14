import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe } from '../services/auth.service';
import { changeOwnPassword } from '../services/password.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const result = await login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/** Any signed in user can change their own password. */
router.post(
  '/change-password',
  authLimiter,
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria.'),
    body('newPassword').notEmpty().withMessage('La nueva contraseña es obligatoria.'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const result = await changeOwnPassword(req.user!.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await getMe(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
