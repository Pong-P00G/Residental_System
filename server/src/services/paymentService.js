import { Payment } from '../models/paymentModel.js';
import { PaymentEvent } from '../models/paymentEventModel.js';
import { Resident } from '../models/residentModel.js';
import { Lease } from '../models/leaseModel.js';
import { Unit } from '../models/unitModel.js';
import * as notifications from './notificationService.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPermission, assertPropertyAccess, propertyScope, requireObjectId } from '../utils/propertyAccess.js';

// Allowed payment status transitions.
const PAYMENT_FLOW = {
    pending: ['processing', 'completed', 'failed', 'cancelled'],
    processing: ['completed', 'failed'],
    completed: ['disputed', 'refunded', 'partially_refunded'],
    failed: ['pending', 'cancelled'],
    partially_refunded: ['refunded', 'disputed'],
    disputed: ['completed', 'refunded'],
    refunded: [],
    cancelled: [],
};

const UPDATABLE_FIELDS = [
    'amount', 'dueDate', 'reference', 'description', 'notes', 'provider',
    'refundAmount', 'refundReason', 'refundReference', 'reconciliationNotes',
];

const actorRoleFor = (role) => (role === 'admin' ? 'admin' : 'manager');

const parseDate = (value, field) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new ApiError(400, `${field} must be a valid date`);
    return date;
};

const loadPayment = async (paymentId) => {
    requireObjectId(paymentId, 'Payment id');
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new ApiError(404, 'Payment not found');
    return payment;
};

const assertPaymentAccess = (actor, payment) => {
    if (actor.user.role === 'user') {
        if (payment.residentId !== actor.user.firebaseUid) {
            throw new ApiError(403, 'You do not have access to this payment');
        }
        return;
    }

    assertPropertyAccess(actor, payment.propertyId);
};

const createEvent = (actor, payment, { fromStatus = '', toStatus, reason, metadata = {} }) =>
    PaymentEvent.create({
        paymentId: payment._id,
        actorId: actor.user.firebaseUid,
        actorRole: actorRoleFor(actor.user.role),
        fromStatus,
        toStatus,
        reason,
        metadata: { ...metadata, ipAddress: actor.ip, userAgent: actor.userAgent },
    });

// Keep the denormalized resident snapshot current when money lands.
const syncResidentSnapshot = async (payment) => {
    if (payment.category !== 'income' || payment.status !== 'completed') return;

    await Resident.updateOne(
        { userId: payment.residentId, propertyId: payment.propertyId, status: { $ne: 'moved_out' } },
        {
            $set: {
                lastPaymentDate: payment.dueDate || new Date(),
                lastPaymentAmount: payment.amount,
            },
        }
    );
};

export async function list(actor, query = {}) {
    const { propertyId, unitId, residentId, status, type, category, from, to } = query;
    const filter = {};

    if (actor.user.role === 'user') {
        filter.residentId = actor.user.firebaseUid;
    } else if (!actor.isAdmin) {
        Object.assign(filter, propertyScope(actor));
    }

    if (propertyId) {
        requireObjectId(propertyId, 'Property id');
        assertPropertyAccess(actor, propertyId);
        filter.propertyId = propertyId;
    }
    if (unitId) filter.unitId = unitId;
    if (residentId && actor.user.role !== 'user') filter.residentId = residentId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (category) filter.category = category;

    if (from || to) {
        filter.dueDate = {};
        if (from) filter.dueDate.$gte = parseDate(from, 'from');
        if (to) filter.dueDate.$lte = parseDate(to, 'to');
    }

    return paginate(Payment, filter, { ...pagination(query), sort: { createdAt: -1 } });
}

export async function create(actor, data) {
    const { propertyId, unitId, leaseId, idempotencyKey } = data;
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);
    await assertPermission(actor, propertyId, 'canRecordPayments');

    // Replaying the same key must not double-charge the ledger
    if (idempotencyKey) {
        const existing = await Payment.findOne({ idempotencyKey });
        if (existing) return { payment: existing, idempotent: true };
    }

    const unit = await Unit.findOne({ _id: unitId, propertyId }).select('_id');
    if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');

    const lease = await Lease.findOne({ _id: leaseId, propertyId }).select('unitId primaryResidentId coResidentIds');
    if (!lease) throw new ApiError(400, 'Lease does not belong to the given property');
    if (String(lease.unitId) !== String(unitId)) {
        throw new ApiError(400, 'Lease does not cover the given unit');
    }

    const residentId = data.residentId || lease.primaryResidentId;
    const leaseParties = [lease.primaryResidentId, ...(lease.coResidentIds || [])];
    if (!leaseParties.includes(residentId)) {
        throw new ApiError(400, 'Resident is not a party to the given lease');
    }

    const payment = await Payment.create({
        ...data,
        residentId,
        recordedBy: actor.user.firebaseUid,
        source: data.source || 'web_app',
    });

    await createEvent(actor, payment, {
        toStatus: payment.status,
        reason: data.description,
        metadata: { providerResponse: data.provider?.transactionId },
    });
    await notifications.notifyPaymentRecorded(payment);

    if (payment.status === 'completed') await syncResidentSnapshot(payment);

    return { payment, idempotent: false };
}

export async function getById(actor, paymentId) {
    const payment = await loadPayment(paymentId);
    assertPaymentAccess(actor, payment);

    const events = await PaymentEvent.find({ paymentId: payment._id }).sort({ createdAt: 1 });

    return { payment, events };
}

export async function update(actor, paymentId, updates = {}) {
    const payment = await loadPayment(paymentId);
    assertPropertyAccess(actor, payment.propertyId);
    await assertPermission(actor, payment.propertyId, 'canRecordPayments');

    const set = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) set[field] = updates[field];
    }

    const statusChanged = Boolean(updates.status) && updates.status !== payment.status;

    if (statusChanged) {
        const allowedNext = PAYMENT_FLOW[payment.status] || [];
        if (!allowedNext.includes(updates.status)) {
            throw new ApiError(400, `Cannot move payment from ${payment.status} to ${updates.status}`);
        }
        set.status = updates.status;
    }

    if (set.status === 'refunded' && !set.refundAmount) {
        set.refundAmount = payment.amount;
    }

    if (set.status === 'partially_refunded') {
        const refunded = set.refundAmount ?? payment.refundAmount;
        if (!refunded || refunded <= 0 || refunded >= payment.amount) {
            throw new ApiError(400, 'A partial refund must be greater than zero and less than the payment amount');
        }
        set.refundAmount = refunded;
    }

    if (updates.reconciled === true) {
        set.reconciledAt = new Date();
        set.reconciledBy = actor.user.firebaseUid;
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported payment fields were provided');
    }

    const updated = await Payment.findByIdAndUpdate(payment._id, { $set: set }, { new: true, runValidators: true });

    if (statusChanged) {
        await createEvent(actor, updated, {
            fromStatus: payment.status,
            toStatus: updated.status,
            reason: updates.reason || updates.refundReason,
            metadata: { refundAmount: set.refundAmount },
        });
        await notifications.notifyPaymentStatusChanged(updated, payment.status);
    }

    if (updated.status === 'completed') await syncResidentSnapshot(updated);

    return updated;
}
