import { Resident } from '../models/residentModel.js';
import { Lease } from '../models/leaseModel.js';
import { Unit } from '../models/unitModel.js';
import { PropertyMember } from '../models/propertyMemberModel.js';
import User from '../models/userModel.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPermission, assertPropertyAccess, propertyScope, requireObjectId } from '../utils/propertyAccess.js';

const UPDATABLE_FIELDS = [
    'unitId', 'type', 'emergencyContact', 'moveInDate', 'moveOutDate', 'expectedMoveOutDate', 'status', 'notes',
];

const loadResident = async (residentId) => {
    requireObjectId(residentId, 'Resident id');
    const resident = await Resident.findById(residentId);
    if (!resident) throw new ApiError(404, 'Resident not found');
    return resident;
};

const assertResidentAccess = (actor, resident) => {
    if (actor.user.role === 'user') {
        if (resident.userId !== actor.user.firebaseUid) {
            throw new ApiError(403, 'You do not have access to this resident');
        }
        return;
    }

    assertPropertyAccess(actor, resident.propertyId);
};

// Property-scoped RBAC relies on the property_members junction, so keep it in
// sync whenever a tenancy starts, changes status or ends.
const syncMembership = async (actor, resident) => {
    if (resident.status === 'moved_out') {
        await PropertyMember.updateMany(
            { userId: resident.userId, propertyId: resident.propertyId, propertyRole: 'resident' },
            { $set: { status: 'inactive' } }
        );
        return;
    }

    if (!['active', 'notice_given'].includes(resident.status)) return;

    const existing = await PropertyMember.findOne({
        userId: resident.userId,
        propertyId: resident.propertyId,
    });

    // Never downgrade an owner/manager membership to a resident one
    if (existing && existing.propertyRole !== 'resident') return;

    if (existing) {
        existing.status = 'active';
        existing.assignedBy = actor.user.firebaseUid;
        existing.assignedAt = new Date();
        await existing.save();
        return;
    }

    await PropertyMember.create({
        userId: resident.userId,
        propertyId: resident.propertyId,
        propertyRole: 'resident',
        status: 'active',
        assignedBy: actor.user.firebaseUid,
    });
};

const releaseUnit = async (resident) => {
    if (!resident.unitId) return;

    await Unit.updateOne(
        { _id: resident.unitId, currentResidentId: resident.userId },
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
};

const moveOut = async (actor, resident, updates = {}) => {
    Object.assign(resident, updates);
    resident.status = 'moved_out';
    if (!resident.moveOutDate) resident.moveOutDate = new Date();

    await resident.save();

    await syncMembership(actor, resident);
    await releaseUnit(resident);

    return resident;
};

export async function list(actor, query = {}) {
    const { propertyId, unitId, status } = query;
    const filter = {};

    if (actor.user.role === 'user') {
        filter.userId = actor.user.firebaseUid;
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

    return paginate(Resident, filter, { ...pagination(query), sort: { createdAt: -1 } });
}

export async function create(actor, data) {
    const { propertyId, unitId, leaseId, userId } = data;
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);
    await assertPermission(actor, propertyId, 'canEditResidents');

    const unit = await Unit.findOne({ _id: unitId, propertyId }).select('_id');
    if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');

    const lease = await Lease.findOne({ _id: leaseId, propertyId }).select('unitId');
    if (!lease) throw new ApiError(400, 'Lease does not belong to the given property');
    if (String(lease.unitId) !== String(unitId)) {
        throw new ApiError(400, 'Lease does not cover the given unit');
    }

    const user = await User.findOne({ firebaseUid: userId, deletedAt: null }).select('_id');
    if (!user) throw new ApiError(404, 'User account not found for that id');

    const duplicate = await Resident.exists({
        userId,
        propertyId,
        status: { $ne: 'moved_out' },
    });
    if (duplicate) throw new ApiError(409, 'This user already has a resident record for the property');

    const resident = await Resident.create(data);

    await User.updateOne({ _id: user._id }, { $addToSet: { propertyIds: propertyId } });
    await syncMembership(actor, resident);

    return resident;
}

export async function getById(actor, residentId) {
    const resident = await loadResident(residentId);
    assertResidentAccess(actor, resident);

    return resident;
}

export async function update(actor, residentId, updates = {}) {
    const resident = await loadResident(residentId);
    assertPropertyAccess(actor, resident.propertyId);
    await assertPermission(actor, resident.propertyId, 'canEditResidents');

    const set = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) set[field] = updates[field];
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported resident fields were provided');
    }

    if (set.unitId) {
        const unit = await Unit.findOne({ _id: set.unitId, propertyId: resident.propertyId }).select('_id');
        if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');
    }

    if (set.status === 'moved_out') {
        return moveOut(actor, resident, set);
    }

    Object.assign(resident, set);
    await resident.save();

    await syncMembership(actor, resident);

    return resident;
}

export async function endTenancy(actor, residentId) {
    const resident = await loadResident(residentId);
    assertPropertyAccess(actor, resident.propertyId);
    await assertPermission(actor, resident.propertyId, 'canEditResidents');

    return moveOut(actor, resident);
}
