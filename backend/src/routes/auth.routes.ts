import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe } from '../services/auth.service';
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

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await getMe(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
