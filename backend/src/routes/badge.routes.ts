import { Router } from 'express';
import {
  getPublicBadges,
  getBadgeBySlug,
  createBadge,
  updateBadge,
  deleteBadge,
  assignBadge,
  getAllBadges,
} from '../services/badge.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const badges = await getPublicBadges();
    res.json(badges);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const badge = await getBadgeBySlug(req.params.slug);
    res.json(badge);
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'COMMUNITY_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getAllBadges(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COMMUNITY_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const badge = await createBadge(req.body);
    res.status(201).json(badge);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'COMMUNITY_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const badge = await updateBadge(req.params.id, req.body);
    res.json(badge);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await deleteBadge(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/assign', authenticate, authorize('ADMIN', 'COMMUNITY_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const { memberId, notes } = req.body;
    const assignment = await assignBadge(memberId, req.params.id, notes, req.user!.id);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

export default router;
