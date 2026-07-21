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
        uploadedById: req.user!.id,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (_req, res, next) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
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

export default router;
