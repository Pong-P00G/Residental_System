import User from '../models/userModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';
import { getFirebaseAuth } from '../config/firebase.js';
import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

const SUPPORTED_PROVIDERS = ['password', 'google.com', 'facebook.com', 'apple.com', 'phone'];

const normaliseProvider = (value) => (SUPPORTED_PROVIDERS.includes(value) ? value : null);

const displayNameFrom = (decodedToken) => {
    const fallback = (decodedToken.email || '').split('@')[0];
    return (decodedToken.name || fallback || 'Resident').trim().slice(0, 80);
};

const assertActive = (user) => {
    if (!user) throw new ApiError(404, 'User account not found');
    if (user.deletedAt || user.status === 'deactivated') {
        throw new ApiError(403, 'This account has been deactivated');
    }
    if (user.status === 'suspended') {
        throw new ApiError(403, 'This account is suspended');
    }
    return user;
};

/**
 * Create or refresh the MongoDB user that mirrors a verified Firebase identity.
 * Called on every authenticated request; only profile fields owned by the
 * identity provider are synced so user edits are never overwritten.
 */
export async function syncUser(decodedToken, { ip } = {}) {
    if (!decodedToken?.uid) throw new ApiError(401, 'Invalid authentication token');

    const provider = normaliseProvider(decodedToken.firebase?.sign_in_provider);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
        if (!decodedToken.email) {
            throw new ApiError(422, 'An email address is required to create an account');
        }

        user = new User({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email.toLowerCase(),
            name: displayNameFrom(decodedToken),
            phoneNumber: decodedToken.phone_number || undefined,
            photoURL: decodedToken.picture || '',
            emailVerified: Boolean(decodedToken.email_verified),
            providers: provider ? [provider] : [],
        });
    } else {
        assertActive(user);

        // Adopt a verified email change made in Firebase
        if (decodedToken.email && decodedToken.email_verified && !user.emailVerified) {
            user.email = decodedToken.email.toLowerCase();
            user.emailVerified = true;
        }
        if (decodedToken.phone_number && !user.phoneNumber) {
            user.phoneNumber = decodedToken.phone_number;
            user.phoneVerified = true;
        }
        if (decodedToken.picture && !user.photoURL) {
            user.photoURL = decodedToken.picture;
        }
        if (provider && !user.providers.includes(provider)) {
            user.providers.push(provider);
        }
    }

    await user.save();
    return user;
}

/**
 * Record a successful sign-in (called by POST /auth/session).
 */
export async function recordLogin(firebaseUid, ip) {
    const user = assertActive(await User.findOne({ firebaseUid }));
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });
    return user;
}

export async function getByFirebaseUid(firebaseUid) {
    return assertActive(await User.findByFirebaseUid(firebaseUid));
}

/**
 * Everything the client needs to know about its access.
 */
export async function getPermissions(firebaseUid, role) {
    if (role === 'admin') {
        return { role, isAdmin: true, allProperties: true, propertyIds: [] };
    }

    const propertyIds = await PropertyMember.getAccessiblePropertyIds(firebaseUid, role);
    return { role, isAdmin: false, allProperties: false, propertyIds };
}

/**
 * Invalidate refresh tokens for a user. Best effort: signing out must not fail
 * when Firebase is unreachable.
 */
export async function revokeSession(firebaseUid) {
    try {
        await getFirebaseAuth().revokeRefreshTokens(firebaseUid);
    } catch (error) {
        logger.warn('Could not revoke Firebase refresh tokens', error.message);
    }
}
