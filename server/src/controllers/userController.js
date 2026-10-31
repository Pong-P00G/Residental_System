import catchAsync from '../utils/catchAsync.js';
import * as userService from '../services/userService.js';

// GET /api/v1/users/me
export const getMe = catchAsync(async (req, res) => {
    const user = await userService.getByFirebaseUid(req.user.firebaseUid);
    res.status(200).json({ success: true, data: user });
});

// PATCH /api/v1/users/me
export const updateMe = catchAsync(async (req, res) => {
    const user = await userService.updateMe(req.user.firebaseUid, req.body);
    res.status(200).json({ success: true, data: user });
});

// DELETE /api/v1/users/me
export const deleteMe = catchAsync(async (req, res) => {
    await userService.deleteMe(req.user.firebaseUid);
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
});

// GET /api/v1/users — admin only
export const listUsers = catchAsync(async (req, res) => {
    const result = await userService.listUsers(req.query);
    res.status(200).json({ success: true, data: result.items, meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
    } });
});

// GET /api/v1/users/:id — admin only
export const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUser(req.params.id);
    res.status(200).json({ success: true, data: user });
});

// PATCH /api/v1/users/:id/role — admin only
export const updateUserRole = catchAsync(async (req, res) => {
    const user = await userService.updateUserRole(req.params.id, req.body.role, req.user.firebaseUid);
    res.status(200).json({ success: true, data: user });
});
