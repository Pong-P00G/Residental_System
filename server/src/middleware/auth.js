import { getFirebaseAuth } from '../config/firebase.js';
import * as authService from '../services/authService.js';
import ApiError from '../utils/apiError.js';

const bearerToken = (req) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token.trim() : null;
};

const verify = async (token) => {
    try {
        return await getFirebaseAuth().verifyIdToken(token, true);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired authentication token');
    }
};

/**
 * Verify the Firebase ID token, sync the MongoDB user and attach it to the request.
 * Sets req.firebaseUser (decoded token) and req.user (Mongoose document).
 */
export const authenticate = async (req, res, next) => {
    try {
        const idToken = bearerToken(req);
        if (!idToken) throw new ApiError(401, 'Authentication token is required');

        const decodedToken = await verify(idToken);
        req.firebaseUser = decodedToken;
        req.user = await authService.syncUser(decodedToken, { ip: req.ip });

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Attach the user when a valid token is present, but never reject the request.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const idToken = bearerToken(req);
        if (!idToken) return next();

        const decodedToken = await verify(idToken);
        req.firebaseUser = decodedToken;
        req.user = await authService.syncUser(decodedToken, { ip: req.ip });
    } catch (error) {
        req.user = undefined;
    }

    next();
};
