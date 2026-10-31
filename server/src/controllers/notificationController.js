import catchAsync from '../utils/catchAsync.js';
import * as notificationService from '../services/notificationService.js';

// PATCH /api/v1/notifications/:notificationId/read
export const markNotificationRead = catchAsync(async (req, res) => {
    const result = await notificationService.markRead(req.user.firebaseUid, req.params.notificationId);

    res.status(200).json({ success: true, data: result });
});

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsRead = catchAsync(async (req, res) => {
    const result = await notificationService.markAllRead(req.user.firebaseUid);

    res.status(200).json({ success: true, data: result });
});
