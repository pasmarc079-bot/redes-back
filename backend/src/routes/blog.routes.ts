import { Router } from 'express';
import {
  getPublicPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getTags,
} from '../services/blog.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin routes (must be before public /:slug to avoid param conflicts)
router.get('/all', authenticate, authorize('ADMIN', 'EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getAllPosts(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/detail/:id', authenticate, authorize('ADMIN', 'EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await getPublicPosts(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    const tags = await getTags();
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const post = await createPost(req.body, req.user!.id);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.body);
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await deletePost(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
