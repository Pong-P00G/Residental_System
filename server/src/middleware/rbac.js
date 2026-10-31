import ApiError from '../utils/apiError.js';
import { Property } from '../models/propertyModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';

// Re-exported so routes can import everything auth-related from one module.
export { authenticate, optionalAuth } from './auth.js';
export { requirePermission } from './permissionError.js';

/**
 * Require specific global role(s).
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return next(new ApiError(401, 'Authentication required'));
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, `Requires role: ${allowedRoles.join(' or ')}`));
        }
        next();
    };
}

export const requireAdmin = requireRole('admin');
export const requireOwner = requireRole('owner', 'admin'); // admin can do owner things
export const requireUser = requireRole('user', 'owner', 'admin');

/**
 * Resolve the property IDs the current user may access.
 * Use after authenticate; controllers read req.accessiblePropertyIds.
 */
export async function resolvePropertyAccess(req, res, next) {
    try {
        const { firebaseUid, role } = req.user;

        if (role === 'admin') {
            const properties = await Property.find({ status: 'active' }).select('_id');
            req.accessiblePropertyIds = properties.map((property) => property._id.toString());
            req.isAdmin = true;
            return next();
        }

        req.accessiblePropertyIds = await PropertyMember.getAccessiblePropertyIds(firebaseUid, role);
        req.isAdmin = false;
        next();
    } catch (error) {
        next(new ApiError(403, 'Failed to resolve property access'));
    }
}

/**
 * Scope a query object to the properties the current user can access.
 */
export function scopeToAccessibleProperties(query) {
    return (req, res, next) => {
        if (!req.isAdmin && req.accessiblePropertyIds?.length > 0) {
            query.propertyId = { $in: req.accessiblePropertyIds };
        }
        next();
    };
}
