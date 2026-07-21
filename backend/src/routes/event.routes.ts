import { Router } from 'express';
import {
  getPublicEvents,
  getEventBySlug,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
} from '../services/event.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Admin routes (must be before public /:slug to avoid param conflicts)
router.get('/all', authenticate, authorize('ADMIN', 'EVENT_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getAllEvents(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/detail/:id', authenticate, authorize('ADMIN', 'EVENT_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const featured = req.query.featured === 'true';
    const result = await getPublicEvents(page, limit, featured);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const event = await getEventBySlug(req.params.slug);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('ADMIN', 'EVENT_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const event = await createEvent(req.body, req.user!.id);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'EVENT_MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const event = await updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await deleteEvent(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
