import { Router } from 'express';
import prisma from '../repository/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/** The list of messages, for the panel. */
router.get('/', authenticate, authorize('ADMIN'), async (_req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { readAt: new Date() },
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


export default router;
