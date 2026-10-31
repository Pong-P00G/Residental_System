import mongoose from 'mongoose';
import ApiError from './apiError.js';
import { PropertyMember } from '../models/propertyMemberModel.js';

// Services receive this trimmed context instead of the Express request.
export const actorFrom = (req) => ({
    user: {
        firebaseUid: req.user.firebaseUid,
        role: req.user.role,
        name: req.user.name,
    },
    isAdmin: Boolean(req.isAdmin),
    accessiblePropertyIds: (req.accessiblePropertyIds || []).map(String),
    ip: req.ip,
    userAgent: typeof req.get === 'function' ? req.get('user-agent') : undefined,
});

export const requireObjectId = (value, label = 'Id') => {
    if (!mongoose.isValidObjectId(value)) throw new ApiError(400, `${label} is invalid`);
    return value;
};

// Admins see everything; everyone else is limited to their resolved memberships.
export const assertPropertyAccess = (req, propertyId) => {
    if (req.isAdmin) return;
    const accessible = (req.accessiblePropertyIds || []).map(String);
    if (!accessible.includes(String(propertyId))) {
        throw new ApiError(403, 'You do not have access to this property');
    }
};

export const assertPermission = async (req, propertyId, permissionKey) => {
    if (req.user.role === 'admin') return;
    const allowed = await PropertyMember.hasPermission(req.user.firebaseUid, propertyId, permissionKey);
    if (!allowed) throw new ApiError(403, `Missing permission: ${permissionKey}`);
};

// Filter fragment for models that carry a propertyId.
export const propertyScope = (req) => ({ propertyId: { $in: req.accessiblePropertyIds || [] } });
