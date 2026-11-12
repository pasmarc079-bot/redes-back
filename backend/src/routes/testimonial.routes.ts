import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { z } from 'zod';
import prisma from '../repository/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { toCanonicalYouTubeUrl } from '../utils/youtube';
import { getGoogleReviews, getGoogleReviewsStatus, getGoogleSummary } from '../services/googleReviews.service';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEO_FOLDER = 'redes-testimonios';
const CLOUDINARY_VIDEO_PREFIX = 'https://res.cloudinary.com/';

// Videos get their own multer instance so the image media library limits stay untouched.
const videoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten videos MP4, WebM o MOV.'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const videoSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(150),
  sourceType: z.enum(['youtube', 'upload']),
  videoUrl: z.string().trim().min(1, 'El enlace del video es obligatorio'),
  posterUrl: z.string().trim().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

const batchSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int(), isActive: z.boolean().optional() })).max(200),
});

const sendValidationError = (res: Response, error: z.ZodError) =>
  res.status(400).json({ error: firstIssue(error) });

interface ParseResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface VideoInput {
  title: string;
  sourceType: 'youtube' | 'upload';
  videoUrl: string;
  posterUrl?: string | null;
  isActive?: boolean;
}

const firstIssue = (error: z.ZodError) => error.issues[0]?.message || 'Datos no válidos';

const parseVideoInput = (body: unknown): ParseResult<VideoInput> => {
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const data = parsed.data as VideoInput;
  if (data.sourceType === 'youtube') {
    const canonical = toCanonicalYouTubeUrl(data.videoUrl);
    if (!canonical) return { ok: false, error: 'El enlace debe ser un video válido de YouTube.' };
    return { ok: true, data: { ...data, videoUrl: canonical } };
  }

  if (!data.videoUrl.startsWith(CLOUDINARY_VIDEO_PREFIX)) {
    return { ok: false, error: 'El video subido debe provenir de nuestro almacenamiento.' };
  }
  return { ok: true, data };
};

const cloudinaryPublicIdFromUrl = (url: string) => {
  const match = url.match(/\/redes-testimonios\/([^./?#]+)\.[a-z0-9]+(?:\?|$)/i);
  return match ? `${VIDEO_FOLDER}/${match[1]}` : null;
};

const uploadVideoToCloudinary = (buffer: Buffer) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: VIDEO_FOLDER, resource_type: 'video' },
      (error, result) => {
        if (error || !result) reject(error || new Error('Upload failed'));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });

const handle = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

// ---------- Public ----------

router.get('/videos', async (_req, res, next) => {
  try {
    const videos = await prisma.testimonialVideo.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(videos);
  } catch (error) {
    next(error);
  }
});

router.get('/reviews/summary', async (_req, res, next) => {
  try {
    res.json(await getGoogleSummary());
  } catch (error) {
    next(error);
  }
});

router.get('/reviews', async (_req, res, next) => {
  try {
    res.json(await getGoogleReviews());
  } catch (error) {
    next(error);
  }
});

// ---------- Admin: videos ----------

const adminOnly = [authenticate, authorize('ADMIN')] as const;

router.get('/admin/videos', ...adminOnly, handle(async (_req, res) => {
  res.json(await prisma.testimonialVideo.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }));
}));

router.post('/admin/videos/upload', ...adminOnly, (req: AuthRequest, res: Response, next: NextFunction) => {
  videoUpload.single('file')(req, res, async (uploadError) => {
    if (uploadError) {
      const message = uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE'
        ? 'El video supera el límite de 50 MB.'
        : uploadError.message;
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    try {
      const result = await uploadVideoToCloudinary(req.file.buffer);
      const posterUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ start_offset: '1', crop: 'fill', width: 720, height: 1280 }],
      });
      res.status(201).json({ videoUrl: result.secure_url, posterUrl });
    } catch (error: any) {
      const rejectedCredentials = error?.http_code === 401 || /invalid api_key|invalid signature|unauthorized/i.test(String(error?.message ?? ''));
      if (rejectedCredentials) {
        return res.status(503).json({
          error: 'El servicio de almacenamiento de videos no está configurado. Sube el video a YouTube y pega el enlace aquí.',
        });
      }
      next(error);
    }
  });
});

router.post('/admin/videos', ...adminOnly, handle(async (req, res) => {
  const parsed = parseVideoInput(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const last = await prisma.testimonialVideo.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  const video = await prisma.testimonialVideo.create({
    data: { ...parsed.data, order: (last?.order ?? 0) + 1 },
  });
  res.status(201).json(video);
}));

router.put('/admin/videos/batch', ...adminOnly, handle(async (req, res) => {
  const parsed = batchSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  await prisma.$transaction(parsed.data.items.map(item => prisma.testimonialVideo.update({
    where: { id: item.id },
    data: { order: item.order, ...(item.isActive !== undefined && { isActive: item.isActive }) },
  })));
  res.json({ success: true });
}));

router.put('/admin/videos/:id', ...adminOnly, handle(async (req, res) => {
  const existing = await prisma.testimonialVideo.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Video no encontrado.' });

  const parsed = parseVideoInput({ ...existing, ...req.body });
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  const video = await prisma.testimonialVideo.update({ where: { id: existing.id }, data: parsed.data });
  res.json(video);
}));

router.delete('/admin/videos/:id', ...adminOnly, handle(async (req, res) => {
  const existing = await prisma.testimonialVideo.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Video no encontrado.' });

  if (existing.sourceType === 'upload') {
    const publicId = cloudinaryPublicIdFromUrl(existing.videoUrl);
    if (publicId) {
      // A failed remote delete should not block removing the entry from the site.
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
        .catch(error => console.warn('No se pudo borrar el video de Cloudinary:', error));
    }
  }

  await prisma.testimonialVideo.delete({ where: { id: existing.id } });
  res.status(204).send();
}));

// ---------- Admin: Google reviews (read-only, sourced from Google) ----------

router.get('/admin/reviews/status', ...adminOnly, handle(async (_req, res) => {
  // Make sure the cache has been filled once, so the admin never reads "0 reviews" right after a restart.
  await getGoogleReviews();
  res.json(getGoogleReviewsStatus());
}));

export default router;
