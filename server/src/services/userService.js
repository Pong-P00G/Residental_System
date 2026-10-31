import mongoose from 'mongoose';
import User from '../models/userModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';
import ApiError from '../utils/apiError.js';

// Fields a user may change on their own profile (role/status stay admin-only).
const PROFILE_FIELDS = ['name', 'email', 'phoneNumber', 'photoURL', 'bio', 'preferences'];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getByFirebaseUid(firebaseUid) {
    const user = await User.findByFirebaseUid(firebaseUid);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
}

/**
 * Apply a partial profile update. Nested preferences are merged, not replaced.
 */
export async function updateMe(firebaseUid, updates = {}) {
    if (!PROFILE_FIELDS.some((field) => updates[field] !== undefined)) {
        throw new ApiError(400, 'No supported profile fields were provided');
    }

    const user = await User.findOne({ firebaseUid, deletedAt: null });
    if (!user) throw new ApiError(404, 'User not found');

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.phoneNumber !== undefined) user.phoneNumber = updates.phoneNumber;
    if (updates.photoURL !== undefined) user.photoURL = updates.photoURL;
    if (updates.bio !== undefined) user.bio = updates.bio;

    if (updates.preferences) {
        const { notifications, ...rest } = updates.preferences;
        Object.assign(user.preferences, rest);
        if (notifications) Object.assign(user.preferences.notifications, notifications);
    }

    // Email lives in Firebase; only adopt it here and force re-verification
    if (updates.email && updates.email.toLowerCase() !== user.email) {
        user.email = updates.email.toLowerCase();
        user.emailVerified = false;
        user.emailChangedAt = new Date();
    }

    if (user.onboardingStatus === 'pending') user.onboardingStatus = 'profile_complete';

    await user.save();
    return user;
}

/**
 * Soft delete: the document is kept for audit history but the account is
 * deactivated and all property memberships are removed.
 */
export async function deleteMe(firebaseUid) {
    const user = await User.findOne({ firebaseUid, deletedAt: null });
    if (!user) throw new ApiError(404, 'User not found');

    await user.softDelete();
    await PropertyMember.updateMany(
        { userId: firebaseUid, status: { $ne: 'removed' } },
        { $set: { status: 'removed' } }
    );

    return user;
}

// ---------------------------------------------------------------- admin only

export async function listUsers({ role, status, search, page = 1, limit = 20 } = {}) {
    const filter = { deletedAt: null };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
        const pattern = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ name: pattern }, { email: pattern }, { phoneNumber: pattern }];
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

    const [items, total] = await Promise.all([
        User.find(filter)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage),
        User.countDocuments(filter),
    ]);

    return {
        items,
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
    };
}

export async function getUser(userId) {
    const filter = mongoose.isValidObjectId(userId)
        ? { _id: userId, deletedAt: null }
        : { firebaseUid: userId, deletedAt: null };

    const user = await User.findOne(filter);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
}

export async function updateUserRole(userId, role, actorFirebaseUid) {
    const user = await getUser(userId);

    if (user.firebaseUid === actorFirebaseUid) {
        throw new ApiError(400, 'You cannot change your own role');
    }

    user.role = role;
    await user.save();
    return user;
}
