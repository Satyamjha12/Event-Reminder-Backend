import { Router } from 'express';
import { 
  getPublicKey, 
  subscribe, 
  unsubscribe, 
  sendTestNotification,
  triggerSchedulerCheck
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public endpoint to get VAPID public key
router.get('/public-key', getPublicKey);

// Protected endpoints (require authentication)
router.post('/subscribe', authMiddleware, subscribe);
router.post('/unsubscribe', authMiddleware, unsubscribe);
router.post('/test', authMiddleware, sendTestNotification);
router.post('/trigger-check', authMiddleware, triggerSchedulerCheck);

export default router;
