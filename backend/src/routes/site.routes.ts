import { Router } from 'express';
import prisma from '../repository/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/settings', async (_req, res) => {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  const result: Record<string, string> = {};
  settings.forEach(s => { result[s.key] = s.value; });
  res.json(result);
});

router.get('/settings/full', async (_req, res) => {
  const settings = await prisma.siteSetting.findMany({ orderBy: { group: 'asc' } });
  res.json(settings);
});

router.put('/settings', authenticate, authorize('ADMIN'), async (req, res) => {
  const updates = req.body as Record<string, string>;
  await prisma.$transaction(
    Object.entries(updates).map(([key, value]) =>
      prisma.siteSetting.update({ where: { key }, data: { value } })
    )
  );
  res.json({ success: true });
});

const menuUpdateFields = ['label', 'order', 'isActive', 'location'] as const;
const contentUpdateFields = ['title', 'body', 'imageUrl', 'isActive', 'order', 'section'] as const;

const pickFields = <T extends Record<string, unknown>>(source: T, fields: readonly string[]) =>
  Object.fromEntries(fields.filter(field => source[field] !== undefined).map(field => [field, source[field]]));

router.put('/pages/:pageKey', authenticate, authorize('ADMIN'), async (req, res) => {
  const { settings = {}, content = [] } = req.body as {
    settings?: Record<string, string>;
    content?: Array<{ key: string } & Record<string, unknown>>;
  };

  if (!settings || typeof settings !== 'object' || !Array.isArray(content)) {
    return res.status(400).json({ error: 'Invalid page configuration payload' });
  }

  await prisma.$transaction([
    ...Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.update({ where: { key }, data: { value } })
    ),
    ...content.map(item => prisma.pageContent.update({
      where: { key: item.key },
      data: pickFields(item, contentUpdateFields),
    })),
  ]);

  res.json({ success: true });
});

router.get('/menu/:location', async (req, res) => {
  const { location } = req.params;
  const items = await prisma.menuItem.findMany({
    where: { location, isActive: true },
    orderBy: { order: 'asc' },
    include: { children: { where: { isActive: true }, orderBy: { order: 'asc' } } },
  });
  res.json(items.filter(i => !i.parentId));
});

router.get('/menu', authenticate, authorize('ADMIN'), async (_req, res) => {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ location: 'asc' }, { order: 'asc' }],
    include: { children: { orderBy: { order: 'asc' } } },
  });
  res.json(items);
});

router.put('/menu/batch', authenticate, authorize('ADMIN'), async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

  await prisma.$transaction(items.map((item: { id: string } & Record<string, unknown>) =>
    prisma.menuItem.update({
      where: { id: item.id },
      data: pickFields(item, menuUpdateFields),
    })
  ));

  res.json({ success: true });
});

router.post('/menu', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.menuItem.create({ data: req.body });
  res.status(201).json(item);
});

router.put('/menu/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body });
  res.json(item);
});

router.delete('/menu/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get('/content', async (req, res) => {
  const section = req.query.section as string | undefined;
  const where = section ? { section, isActive: true } : { isActive: true };
  const items = await prisma.pageContent.findMany({ where, orderBy: [{ section: 'asc' }, { order: 'asc' }] });
  res.json(items);
});

router.get('/content/admin', authenticate, authorize('ADMIN'), async (_req, res) => {
  const items = await prisma.pageContent.findMany({ orderBy: [{ section: 'asc' }, { order: 'asc' }] });
  res.json(items);
});

router.put('/content/batch', authenticate, authorize('ADMIN'), async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

  await prisma.$transaction(items.map((item: { id: string } & Record<string, unknown>) =>
    prisma.pageContent.update({
      where: { id: item.id },
      data: pickFields(item, contentUpdateFields),
    })
  ));

  res.json({ success: true });
});

router.post('/content', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.pageContent.create({ data: req.body });
  res.status(201).json(item);
});

router.put('/content/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.pageContent.update({ where: { id: req.params.id }, data: req.body });
  res.json(item);
});

router.delete('/content/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.pageContent.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get('/services', async (_req, res) => {
  const items = await prisma.serviceSchedule.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  res.json(items);
});

router.get('/services/admin', authenticate, authorize('ADMIN'), async (_req, res) => {
  const items = await prisma.serviceSchedule.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

router.post('/services', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.serviceSchedule.create({ data: req.body });
  res.status(201).json(item);
});

router.put('/services/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const item = await prisma.serviceSchedule.update({ where: { id: req.params.id }, data: req.body });
  res.json(item);
});

router.delete('/services/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  await prisma.serviceSchedule.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
