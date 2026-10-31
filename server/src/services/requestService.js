import { Request } from '../models/requestModel.js';
import { RequestEvent } from '../models/requesteventModel.js';
import { Unit } from '../models/unitModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';
import * as notifications from './notificationService.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPropertyAccess, requireObjectId } from '../utils/propertyAccess.js';

// Allowed status transitions for maintenance requests.
const STATUS_FLOW = {
    submitted: ['triaged', 'scheduled', 'cancelled'],
    triaged: ['scheduled', 'in_progress', 'cancelled'],
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['resolved', 'cancelled'],
    resolved: ['closed', 'in_progress'],
    closed: [],
    cancelled: [],
};

const STATUS_TIMESTAMP = {
    triaged: 'triagedAt',
    scheduled: 'scheduledAt',
    in_progress: 'startedAt',
    resolved: 'resolvedAt',
    closed: 'closedAt',
};

const actorRoleFor = (role) => (role === 'user' ? 'resident' : 'manager');

// Managers need the granular permission; admins bypass it.
const assertCanManage = async (actor, propertyId) => {
    if (actor.user.role === 'admin') return;
    const allowed = await PropertyMember.hasPermission(actor.user.firebaseUid, propertyId, 'canManageRequests');
    if (!allowed) throw new ApiError(403, 'Missing permission: canManageRequests');
};

const loadRequest = async (requestId) => {
    requireObjectId(requestId, 'Request id');
    const request = await Request.findOne({ _id: requestId, deletedAt: null });
    if (!request) throw new ApiError(404, 'Request not found');
    return request;
};

const canSeeRequest = (actor, request) => {
    if (actor.user.role === 'user') {
        if (request.residentId !== actor.user.firebaseUid) {
            throw new ApiError(403, 'You do not have access to this request');
        }
        return;
    }
    assertPropertyAccess(actor, request.propertyId);
};

const createEvent = (actor, request, { fromStatus = '', toStatus, reason, metadata = {} }) =>
    RequestEvent.create({
        requestId: request._id,
        actorId: actor.user.firebaseUid,
        actorRole: actorRoleFor(actor.user.role),
        actorName: actor.user.name,
        fromStatus,
        toStatus,
        reason,
        metadata: { ...metadata, ipAddress: actor.ip, userAgent: actor.userAgent },
    });

export async function create(actor, data) {
    const { propertyId, unitId, title, description, category, priority, evidenceUrls, source } = data;

    assertPropertyAccess(actor, propertyId);

    const unit = await Unit.findOne({ _id: unitId, propertyId }).select('_id');
    if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');

    let residentId = actor.user.firebaseUid;

    // Only managers/admin may raise a request on behalf of another resident
    if (data.residentId && data.residentId !== residentId) {
        if (actor.user.role === 'user') {
            throw new ApiError(403, 'You can only create requests for yourself');
        }
        await assertCanManage(actor, propertyId);
        residentId = data.residentId;
    }

    const request = await Request.create({
        propertyId,
        unitId,
        residentId,
        title,
        description,
        category,
        priority,
        evidenceUrls: evidenceUrls || [],
        source: source || 'web_app',
    });

    await createEvent(actor, request, { toStatus: 'submitted' });
    await notifications.notifyRequestCreated(request);

    return request;
}

export async function list(actor, query = {}) {
    const { status, priority, category, propertyId } = query;
    const filter = { deletedAt: null };

    if (actor.user.role === 'user') {
        // Residents only ever see their own requests
        filter.residentId = actor.user.firebaseUid;
    } else if (!actor.isAdmin) {
        filter.propertyId = { $in: actor.accessiblePropertyIds };
    }

    if (propertyId) {
        assertPropertyAccess(actor, propertyId);
        filter.propertyId = propertyId;
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    return paginate(Request, filter, { ...pagination(query), sort: { createdAt: -1 } });
}

export async function getById(actor, requestId) {
    const request = await loadRequest(requestId);
    canSeeRequest(actor, request);

    const events = await RequestEvent.find({ requestId: request._id }).sort({ createdAt: 1 });

    return { request, events };
}

export async function updateStatus(actor, requestId, payload = {}) {
    const request = await loadRequest(requestId);
    assertPropertyAccess(actor, request.propertyId);
    await assertCanManage(actor, request.propertyId);

    const { status, reason, note, assignedTo, assignedToType, scheduledDate, estimatedCost, actualCost } = payload;
    const previousStatus = request.status;

    if (status === previousStatus) {
        throw new ApiError(400, `Request is already ${status}`);
    }

    const allowedNext = STATUS_FLOW[previousStatus] || [];
    if (!allowedNext.includes(status)) {
        throw new ApiError(400, `Cannot move request from ${previousStatus} to ${status}`);
    }

    request.status = status;
    const stamp = STATUS_TIMESTAMP[status];
    if (stamp) request[stamp] = new Date();

    if (assignedTo) {
        request.assignedTo = assignedTo;
        request.assignedToType = assignedToType || 'manager';
    }
    if (scheduledDate) request.scheduledDate = scheduledDate;
    if (estimatedCost !== undefined) request.estimatedCost = estimatedCost;
    if (actualCost !== undefined) request.actualCost = actualCost;

    if (note) {
        request.comments.push({
            authorId: actor.user.firebaseUid,
            authorRole: actorRoleFor(actor.user.role),
            content: note,
            isInternal: true,
        });
    }

    await request.save();
    await createEvent(actor, request, {
        fromStatus: previousStatus,
        toStatus: status,
        reason,
        metadata: { scheduledDate: request.scheduledDate, cost: actualCost },
    });
    await notifications.notifyRequestStatusChanged(request, previousStatus);

    return request;
}

export async function remove(actor, requestId) {
    const request = await loadRequest(requestId);

    request.deletedAt = new Date();
    if (request.status !== 'cancelled') request.status = 'cancelled';
    await request.save();

    await createEvent(actor, request, {
        fromStatus: request.status,
        toStatus: 'cancelled',
        reason: 'Deleted by administrator',
    });

    return request;
}
