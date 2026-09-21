import { Router } from 'express';
import prisma from '../repository/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public: Get active social configs
router.get('/configs', async (_req, res, next) => {
  try {
    const configs = await prisma.socialConfig.findMany({
      where: { isActive: true },
      select: { platform: true, accountUrl: true, feedUrl: true, iconName: true, color: true, order: true, isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all social configs (including inactive)
router.get('/admin/configs', authenticate, authorize('ADMIN'), async (_req, res, next) => {
  try {
    const configs = await prisma.socialConfig.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

router.put('/admin/configs', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

    const existing = await prisma.socialConfig.findMany({ select: { id: true } });
    const incomingIds = new Set(items.filter((item: { id?: string }) => item.id).map((item: { id: string }) => item.id));
    const operations = [
      ...existing.filter(item => !incomingIds.has(item.id)).map(item => prisma.socialConfig.delete({ where: { id: item.id } })),
      ...items.map((item: Record<string, unknown>) => {
        const data = {
          platform: String(item.platform || ''),
          accountUrl: item.accountUrl ? String(item.accountUrl) : null,
          feedUrl: item.feedUrl ? String(item.feedUrl) : null,
          iconName: item.iconName ? String(item.iconName) : null,
          color: item.color ? String(item.color) : null,
          order: Number(item.order || 0),
          isActive: item.isActive !== false,
        };
        return item.id
          ? prisma.socialConfig.update({ where: { id: String(item.id) }, data })
          : prisma.socialConfig.create({ data });
      }),
    ];

    await prisma.$transaction(operations);
    const configs = await prisma.socialConfig.findMany({ orderBy: { order: 'asc' } });
    res.json(configs);
  } catch (error) {
    next(error);
  }
});

// Admin: Create social config
router.post('/admin/configs', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { platform, accountUrl, feedUrl, iconName, color, order, isActive } = req.body;
    const config = await prisma.socialConfig.create({
      data: { platform, accountUrl, feedUrl, iconName, color, order, isActive },
    });
    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
});

// Admin: Update social config
router.put('/admin/configs/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { platform, accountUrl, feedUrl, iconName, color, order, isActive } = req.body;
    const config = await prisma.socialConfig.update({
      where: { id },
      data: { platform, accountUrl, feedUrl, iconName, color, order, isActive },
    });
    res.json(config);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete social config
router.delete('/admin/configs/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.socialConfig.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
