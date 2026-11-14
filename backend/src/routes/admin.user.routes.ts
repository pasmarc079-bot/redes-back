import { Router } from 'express';
import { body, param } from 'express-validator';
import { setUserPassword } from '../services/password.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/** An administrator can reset the password of any account. */
router.put(
  '/:username/password',
  authenticate,
  authorize('ADMIN'),
  [
    param('username').trim().notEmpty().withMessage('Falta el usuario.'),
    body('newPassword').notEmpty().withMessage('La nueva contraseña es obligatoria.'),
  ],
  async (req, res, next) => {
    try {
      const user = await setUserPassword(req.params.username, req.body.newPassword);
      res.json({ ok: true, user });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
