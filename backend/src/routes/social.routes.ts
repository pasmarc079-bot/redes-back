import { Router } from 'express';
import prisma from '../repository/prisma';

const router = Router();

router.get('/configs', async (_req, res, next) => {
  try {
    const configs = await prisma.socialConfig.findMany({
      where: { isActive: true },
      select: { platform: true, accountUrl: true, feedUrl: true },
    });
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

export default router;
