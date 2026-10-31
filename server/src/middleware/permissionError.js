import ApiError from '../utils/apiError.js';
import { PropertyMember } from '../models/propertyMemberModel.js';


export const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const propertyId = req.params.propertyId || req.body?.propertyId;

            if (!user) throw new ApiError(401, 'Authentication required');
            // Admins bypass per-property permissions
            if (user.role === 'admin') return next();
            // No property scope required for this route
            if (!propertyId) return next();

            const allowed = await PropertyMember.hasPermission(user.firebaseUid, propertyId, permissionKey);
            if (!allowed) {
                throw new ApiError(403, `Missing permission: ${permissionKey}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default requirePermission;
