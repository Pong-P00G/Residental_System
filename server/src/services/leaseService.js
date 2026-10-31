import { Lease } from '../models/leaseModel.js';
import { Resident } from '../models/residentModel.js';
import { Unit } from '../models/unitModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPermission, assertPropertyAccess, propertyScope, requireObjectId } from '../utils/propertyAccess.js';

// Allowed lease lifecycle transitions.
const LEASE_FLOW = {
    draft: ['sent', 'signed', 'active', 'terminated'],
    sent: ['draft', 'signed', 'active', 'terminated'],
    signed: ['active', 'terminated'],
    active: ['expiring', 'expired', 'terminated', 'renewed'],
    expiring: ['renewed', 'expired', 'terminated'],
    expired: ['renewed'],
    terminated: [],
    renewed: ['active', 'expiring', 'expired', 'terminated'],
};

const UPDATABLE_FIELDS = [
    'leaseType', 'startDate', 'endDate', 'renewalDate', 'noticePeriodDays', 'rentAmount', 'rentFrequency',
    'depositAmount', 'depositHeld', 'depositStatus', 'currency', 'charges', 'leaseDocumentUrl',
    'signedDocumentUrl', 'signedAt', 'status', 'terminationReason', 'terminationDate', 'notes',
];

const loadLease = async (leaseId) => {
    requireObjectId(leaseId, 'Lease id');
    const lease = await Lease.findById(leaseId);
    if (!lease) throw new ApiError(404, 'Lease not found');
    return lease;
};

const assertLeaseAccess = (actor, lease) => {
    if (actor.user.role === 'user') {
        const isParty = lease.primaryResidentId === actor.user.firebaseUid
            || (lease.coResidentIds || []).includes(actor.user.firebaseUid);
        if (!isParty) throw new ApiError(403, 'You do not have access to this lease');
        return;
    }

    assertPropertyAccess(actor, lease.propertyId);
};

// Keep the unit and resident records consistent with the lease lifecycle.
export const syncLeaseOccupancy = async (lease) => {
    const unitFilter = { _id: lease.unitId, propertyId: lease.propertyId };

    if (lease.status === 'active') {
        await Unit.updateOne(unitFilter, {
            $set: {
                status: 'occupied',
                currentResidentId: lease.primaryResidentId,
                currentLeaseId: lease._id,
                leaseStartDate: lease.startDate,
                leaseEndDate: lease.endDate,
            },
        });
        return;
    }

    if (lease.status === 'terminated' || lease.status === 'expired') {
        await Unit.updateOne(
            { ...unitFilter, currentLeaseId: lease._id },
            {
                $set: {
                    status: 'vacant',
                    currentResidentId: null,
                    currentLeaseId: null,
                    leaseStartDate: null,
                    leaseEndDate: null,
                },
            }
        );

        await Resident.updateMany(
            { leaseId: lease._id, status: { $ne: 'moved_out' } },
            { $set: { status: 'moved_out', moveOutDate: lease.terminationDate || new Date() } }
        );

        await PropertyMember.updateMany(
            { userId: lease.primaryResidentId, propertyId: lease.propertyId, propertyRole: 'resident' },
            { $set: { status: 'inactive' } }
        );
    }
};

export async function list(actor, query = {}) {
    const { propertyId, unitId, status } = query;
    const filter = {};

    if (actor.user.role === 'user') {
        filter.$or = [
            { primaryResidentId: actor.user.firebaseUid },
            { coResidentIds: actor.user.firebaseUid },
        ];
    } else if (!actor.isAdmin) {
        Object.assign(filter, propertyScope(actor));
    }

    if (propertyId) {
        requireObjectId(propertyId, 'Property id');
        assertPropertyAccess(actor, propertyId);
        filter.propertyId = propertyId;
    }
    if (unitId) filter.unitId = unitId;
    if (status) filter.status = status;

    return paginate(Lease, filter, { ...pagination(query), sort: { createdAt: -1 } });
}

export async function create(actor, data) {
    const { propertyId, unitId } = data;
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);
    await assertPermission(actor, propertyId, 'canManageLeases');

    const unit = await Unit.findOne({ _id: unitId, propertyId }).select('_id');
    if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');

    const lease = await Lease.create({ ...data, createdBy: actor.user.firebaseUid });
    if (lease.status === 'active') await syncLeaseOccupancy(lease);

    return lease;
}

export async function getById(actor, leaseId) {
    const lease = await loadLease(leaseId);
    assertLeaseAccess(actor, lease);

    return lease;
}

export async function update(actor, leaseId, updates = {}) {
    const lease = await loadLease(leaseId);
    assertPropertyAccess(actor, lease.propertyId);
    await assertPermission(actor, lease.propertyId, 'canManageLeases');

    const set = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) set[field] = updates[field];
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported lease fields were provided');
    }

    if (set.status && set.status !== lease.status) {
        const allowedNext = LEASE_FLOW[lease.status] || [];
        if (!allowedNext.includes(set.status)) {
            throw new ApiError(400, `Cannot move lease from ${lease.status} to ${set.status}`);
        }

        if (set.status === 'terminated' && !set.terminationDate) set.terminationDate = new Date();
        if (set.status === 'signed' && !lease.signedAt && !set.signedAt) set.signedAt = new Date();
    }

    if (set.status === 'terminated') set.terminatedBy = actor.user.firebaseUid;

    const updated = await Lease.findByIdAndUpdate(lease._id, { $set: set }, { new: true, runValidators: true });

    if (updated.status !== lease.status || ['active', 'terminated', 'expired'].includes(updated.status)) {
        await syncLeaseOccupancy(updated);
    }

    return updated;
}
