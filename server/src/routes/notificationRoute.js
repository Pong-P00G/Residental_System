import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

// PATCH /api/v1/notifications/read-all
// Clears the caller's unread feed in batches.
router.patch('/read-all', notificationController.markAllNotificationsRead);

// PATCH /api/v1/notifications/:notificationId/read
// Notifications are stored at users/{uid}/notifications, so a user can only
// ever address documents in their own subcollection.
router.patch('/:notificationId/read', notificationController.markNotificationRead);

export default router;
