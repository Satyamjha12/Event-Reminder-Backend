import { Router } from 'express';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getPublicEvents 
} from '../controllers/eventController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public route - no authentication required
// GET /api/events/public
router.get('/public', getPublicEvents);

// Protected routes - authentication required
// GET /api/events
router.get('/', authMiddleware, getEvents);

// POST /api/events
router.post('/', authMiddleware, createEvent);

// PATCH /api/events/:id
router.patch('/:id', authMiddleware, updateEvent);

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, deleteEvent);

export default router;
