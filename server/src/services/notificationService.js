import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDb } from '../config/firebase.js';
import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

// Each user owns a subcollection so Firestore rules can scope reads to
// request.auth.uid and clients can stream users/{uid}/notifications directly.
const COLLECTION = 'notifications';
const CHANNEL = 'in_app';

const humanise = (value = '') => String(value).replace(/_/g, ' ');
const money = (amount, currency = 'USD') => `${currency} ${Number(amount || 0).toFixed(2)}`;

/**
 * Payload builders are pure so the wording can be unit tested without Firestore.
 */
export const buildRequestNotification = (request, { event = 'status', previousStatus } = {}) => {
    const requestId = String(request._id);
    const data = {
        requestId,
        status: request.status,
        deepLink: `/requests/${requestId}`,
    };
    if (previousStatus) data.previousStatus = previousStatus;

    if (event === 'created') {
        return {
            type: 'request_update',
            channel: CHANNEL,
            title: 'Request received',
            body: `Your request "${request.title}" was submitted.`,
            data,
        };
    }

    return {
        type: 'request_update',
        channel: CHANNEL,
        title: 'Request updated',
        body: `Your request "${request.title}" is now ${humanise(request.status)}.`,
        data,
    };
};

export const buildPaymentNotification = (payment, { event = 'status', previousStatus } = {}) => {
    const paymentId = String(payment._id);
    const data = {
        paymentId,
        status: payment.status,
        deepLink: `/payments/${paymentId}`,
    };
    if (previousStatus) data.previousStatus = previousStatus;

    if (event === 'recorded') {
        const suffix = payment.status === 'completed' ? '' : ` (${humanise(payment.status)})`;
        return {
            type: 'payment_received',
            channel: CHANNEL,
            title: 'Payment recorded',
            body: `${money(payment.amount, payment.currency)} ${humanise(payment.type)} payment recorded${suffix}.`,
            data,
        };
    }

    return {
        type: 'payment_received',
        channel: CHANNEL,
        title: 'Payment updated',
        body: `Your ${humanise(payment.type)} payment of ${money(payment.amount, payment.currency)} is now ${humanise(payment.status)}.`,
        data,
    };
};

const writeNotification = async (userId, notification, propertyId) => {
    const db = getFirestoreDb();

    // Notifications are optional infrastructure: without credentials we skip
    // rather than failing the request or payment that triggered them.
    if (!db) {
        logger.warn('Skipping notification: Firestore is not configured');
        return false;
    }

    try {
        await db.collection('users').doc(String(userId)).collection(COLLECTION).add({
            userId: String(userId),
            propertyId: propertyId ? String(propertyId) : null,
            type: notification.type,
            channel: notification.channel,
            title: notification.title,
            body: notification.body,
            data: Object.fromEntries(
                Object.entries(notification.data || {}).map(([key, value]) => [key, String(value)])
            ),
            status: 'sent',
            readAt: null,
            createdAt: FieldValue.serverTimestamp(),
        });
        return true;
    } catch (error) {
        logger.error('Failed to write notification', error.message);
        return false;
    }
};

/**
 * Deliver one notification to many users. Never throws.
 */
export async function notifyUsers(userIds, notification, propertyId) {
    const recipients = [...new Set((userIds || []).filter(Boolean).map(String))];
    if (recipients.length === 0) return { delivered: 0, skipped: 0 };

    const results = await Promise.all(
        recipients.map((userId) => writeNotification(userId, notification, propertyId))
    );

    return {
        delivered: results.filter(Boolean).length,
        skipped: results.filter((delivered) => !delivered).length,
    };
}

export async function notifyUser(userId, notification, propertyId) {
    const { delivered } = await notifyUsers([userId], notification, propertyId);
    return { delivered: delivered === 1 };
}

export async function notifyRequestCreated(request) {
    return notifyUser(
        request.residentId,
        buildRequestNotification(request, { event: 'created' }),
        request.propertyId
    );
}

export async function notifyRequestStatusChanged(request, previousStatus) {
    return notifyUser(
        request.residentId,
        buildRequestNotification(request, { event: 'status', previousStatus }),
        request.propertyId
    );
}

export async function notifyPaymentRecorded(payment) {
    return notifyUser(
        payment.residentId,
        buildPaymentNotification(payment, { event: 'recorded' }),
        payment.propertyId
    );
}

export async function notifyPaymentStatusChanged(payment, previousStatus) {
    return notifyUser(
        payment.residentId,
        buildPaymentNotification(payment, { event: 'status', previousStatus }),
        payment.propertyId
    );
}

// Firestore document ids are path segments: no slashes and never empty.
const NOTIFICATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const toIso = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return null;
};

/**
 * Mark one of the caller's notifications as read.
 * Unlike delivery, this is a client-facing action so failures are surfaced.
 */
export async function markRead(userId, notificationId) {
    if (!NOTIFICATION_ID_PATTERN.test(String(notificationId ?? ''))) {
        throw new ApiError(400, 'Notification id is invalid');
    }

    const db = getFirestoreDb();
    if (!db) {
        throw new ApiError(503, 'Notifications are not configured on this server');
    }

    const ref = db.collection('users').doc(String(userId)).collection(COLLECTION).doc(String(notificationId));

    try {
        const snapshot = await ref.get();
        if (!snapshot.exists) throw new ApiError(404, 'Notification not found');

        const current = snapshot.data();
        if (current.readAt) {
            return {
                id: String(notificationId),
                read: true,
                readAt: toIso(current.readAt),
                alreadyRead: true,
            };
        }

        await ref.update({ readAt: FieldValue.serverTimestamp(), status: 'read' });

        const updated = await ref.get();
        return {
            id: String(notificationId),
            read: true,
            readAt: toIso(updated.get('readAt')),
            alreadyRead: false,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Failed to mark notification read', error.message);
        throw new ApiError(502, 'Could not update the notification');
    }
}

// Firestore commits at most 500 writes per batch.
const BATCH_SIZE = 500;

/**
 * Mark every unread notification of the caller as read.
 * Idempotent: an already-clear feed reports 0 updates.
 */
export async function markAllRead(userId) {
    const db = getFirestoreDb();
    if (!db) {
        throw new ApiError(503, 'Notifications are not configured on this server');
    }

    try {
        const snapshot = await db
            .collection('users')
            .doc(String(userId))
            .collection(COLLECTION)
            .where('readAt', '==', null)
            .get();

        if (snapshot.empty) return { read: true, updated: 0 };

        for (let index = 0; index < snapshot.docs.length; index += BATCH_SIZE) {
            const batch = db.batch();
            for (const document of snapshot.docs.slice(index, index + BATCH_SIZE)) {
                batch.update(document.ref, { readAt: FieldValue.serverTimestamp(), status: 'read' });
            }
            await batch.commit();
        }

        return { read: true, updated: snapshot.docs.length };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Failed to mark notifications read', error.message);
        throw new ApiError(502, 'Could not update notifications');
    }
}
