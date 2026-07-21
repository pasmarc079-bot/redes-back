import { Router } from 'express';
import prisma from '../repository/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        badges: {
          include: { badge: true },
        },
      },
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (error) {
    next(error);
  }
});

export default router;
