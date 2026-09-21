import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../repository/prisma';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const label = req.body.label?.trim();
    if (!label) {
      return res.status(400).json({ error: 'Debes asignar al menos una etiqueta.' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'redes-media',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    const media = await prisma.media.create({
      data: {
        originalUrl: result.secure_url,
        thumbnailUrl: cloudinary.url(result.public_id, {
          transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
        }),
        mediumUrl: cloudinary.url(result.public_id, {
          transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }],
        }),
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: BigInt(req.file.size),
        width: result.width,
        height: result.height,
        label,
        uploadedById: req.user!.id,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    next(error);
  }
});

router.get('/usage/:url', authenticate, async (req: AuthRequest, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const usage: string[] = [];

    const events = await prisma.event.findMany({
      where: { flyerUrl: url },
      select: { id: true, title: true },
    });
    events.forEach((e) => usage.push(`Evento: ${e.title}`));

    const posts = await prisma.blogPost.findMany({
      where: { OR: [{ coverImageUrl: url }, { content: { contains: url } }] },
      select: { id: true, title: true },
    });
    posts.forEach((p) => usage.push(`Blog: ${p.title}`));

    const settings = await prisma.siteSetting.findMany({
      where: { value: url },
      select: { key: true, label: true },
    });
    settings.forEach((s) => usage.push(`Config: ${s.label || s.key}`));

    const heroSlides = await prisma.pageContent.findMany({
      where: { OR: [{ imageUrl: url }, { body: { contains: url } }] },
      select: { key: true, section: true },
    });
    heroSlides.forEach((h) => usage.push(`Contenido: ${h.section}/${h.key}`));

    res.json({ usage, count: usage.length });
  } catch (error) {
    res.json({ usage: [], count: 0 });
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { fileName: { contains: String(search), mode: 'insensitive' as const } },
            { label: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }
      : {};
    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(media);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/label', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { label } = req.body;
    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: { label: label || null },
    });
    res.json(media);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const publicId = media.originalUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`redes-media/${publicId}`);
    }

    await prisma.media.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/health', authenticate, async (_req, res) => {
  try {
    const config = cloudinary.config();
    const hasConfig = !!(config.cloud_name && config.api_key && config.api_secret);

    if (!hasConfig) {
      return res.json({ status: 'error', message: 'Cloudinary credentials not configured', config: false });
    }

    const result = await cloudinary.api.ping();
    res.json({
      status: 'ok',
      config: true,
      cloud_name: config.cloud_name,
      result,
    });
  } catch (error: any) {
    res.json({
      status: 'error',
      message: error.message || 'Cloudinary connection failed',
      config: !!cloudinary.config().cloud_name,
    });
  }
});

export default router;
