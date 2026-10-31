import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/authService.js';

// POST /api/v1/auth/session — exchange a verified Firebase session for the app user.
export const createSession = catchAsync(async (req, res) => {
    const user = await authService.recordLogin(req.user.firebaseUid, req.ip);
    const permissions = await authService.getPermissions(user.firebaseUid, user.role);

    res.status(200).json({ success: true, data: { user, permissions } });
});

// GET /api/v1/auth/session — restore the current session.
export const getSession = catchAsync(async (req, res) => {
    const user = await authService.getByFirebaseUid(req.user.firebaseUid);
    const permissions = await authService.getPermissions(user.firebaseUid, user.role);

    res.status(200).json({ success: true, data: { user, permissions } });
});

// POST /api/v1/auth/logout — revoke refresh tokens so the session cannot be replayed.
export const logout = catchAsync(async (req, res) => {
    await authService.revokeSession(req.user.firebaseUid);
    res.status(200).json({ success: true, message: 'Signed out' });
});
