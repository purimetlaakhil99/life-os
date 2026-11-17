import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  snoozeNotification,
  subscribePush,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);
router.post('/:id/snooze', snoozeNotification);
router.post('/subscribe-push', subscribePush);

export default router;
