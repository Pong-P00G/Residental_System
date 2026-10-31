// Firebase Admin initialization (server-side token verification only).
// Credentials come from the environment — never hard-code service account keys.
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

const parsePrivateKey = (value = '') => value.replace(/\\n/g, '\n');

const serviceAccount = () => {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return null;
    return {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: parsePrivateKey(FIREBASE_PRIVATE_KEY),
    };
};

export const firebaseConfigured = () =>
    Boolean(serviceAccount() || process.env.GOOGLE_APPLICATION_CREDENTIALS);

let firebaseApp = null;
let initialised = false;

/**
 * Initialize the Firebase Admin SDK once per process.
 * Returns null when no credentials are configured so the API can still boot.
 */
export function initFirebase() {
    if (initialised) return firebaseApp;
    initialised = true;

    if (!firebaseConfigured()) {
        logger.warn(
            'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
            'FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS) to enable token verification.'
        );
        return null;
    }

    try {
        const credentials = serviceAccount();
        firebaseApp = getApps()[0] || initializeApp({
            credential: credentials ? cert(credentials) : applicationDefault(),
        });
        logger.info('Firebase Admin initialised');
    } catch (error) {
        logger.error('Failed to initialise Firebase Admin', error.message);
        firebaseApp = null;
    }

    return firebaseApp;
}

/**
 * Firebase Auth instance used to verify ID tokens.
 * Throws a 503 instead of crashing when the server has no credentials.
 */
export function getFirebaseAuth() {
    const app = initFirebase();
    if (!app) {
        throw new ApiError(503, 'Authentication service is not configured on this server');
    }
    return getAuth(app);
}

/**
 * Firestore handle for client-facing data (notifications).
 * Returns null when credentials are missing so callers can skip silently.
 */
export function getFirestoreDb() {
    const app = initFirebase();
    if (!app) return null;
    return getFirestore(app);
}

export default initFirebase;
