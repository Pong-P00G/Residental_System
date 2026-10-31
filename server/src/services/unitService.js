import { Unit } from '../models/unitModel.js';
import { Property } from '../models/propertyModel.js';
import { Resident } from '../models/residentModel.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPermission, assertPropertyAccess, propertyScope, requireObjectId } from '../utils/propertyAccess.js';

const UPDATABLE_FIELDS = [
    'unitNumber', 'floor', 'label', 'type', 'sizeSqft', 'bedrooms', 'bathrooms', 'amenities',
    'rentAmount', 'depositAmount', 'maintenanceFee', 'currency', 'photos', 'floorPlanUrl', 'status', 'notes',
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const residentUnitIds = async (firebaseUid) => {
    const residents = await Resident.find({ userId: firebaseUid, status: { $ne: 'moved_out' } }).select('unitId');
    return residents.map((resident) => resident.unitId);
};

// Keep the denormalized counters on the property in sync with its units.
export const refreshPropertyCounters = async (propertyId) => {
    const [totalUnits, occupiedUnits, vacantUnits] = await Promise.all([
        Unit.countDocuments({ propertyId }),
        Unit.countDocuments({ propertyId, status: 'occupied' }),
        Unit.countDocuments({ propertyId, status: 'vacant' }),
    ]);

    await Property.updateOne({ _id: propertyId }, { $set: { totalUnits, occupiedUnits, vacantUnits } });
};

export const assertUnitAccess = async (actor, unit) => {
    if (actor.user.role === 'user') {
        if (unit.currentResidentId && unit.currentResidentId === actor.user.firebaseUid) return;

        const resident = await Resident.exists({
            userId: actor.user.firebaseUid,
            unitId: unit._id,
            status: { $ne: 'moved_out' },
        });
        if (!resident) throw new ApiError(403, 'You do not have access to this unit');
        return;
    }

    assertPropertyAccess(actor, unit.propertyId);
};

export async function list(actor, query = {}) {
    const { propertyId, status, type, search } = query;
    const filter = {};

    if (actor.user.role === 'user') {
        filter._id = { $in: await residentUnitIds(actor.user.firebaseUid) };
    } else if (!actor.isAdmin) {
        Object.assign(filter, propertyScope(actor));
    }

    if (propertyId) {
        requireObjectId(propertyId, 'Property id');
        assertPropertyAccess(actor, propertyId);
        filter.propertyId = propertyId;
    }
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
        const pattern = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ unitNumber: pattern }, { label: pattern }];
    }

    return paginate(Unit, filter, { ...pagination(query), sort: { propertyId: 1, unitNumber: 1 } });
}

export async function create(actor, data) {
    const { propertyId, unitNumber } = data;
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);
    await assertPermission(actor, propertyId, 'canManageUnits');

    const duplicate = await Unit.exists({ propertyId, unitNumber });
    if (duplicate) throw new ApiError(409, `Unit ${unitNumber} already exists in this property`);

    const unit = await Unit.create(data);
    await refreshPropertyCounters(unit.propertyId);

    return unit;
}

export async function getById(actor, unitId) {
    requireObjectId(unitId, 'Unit id');

    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, 'Unit not found');

    await assertUnitAccess(actor, unit);
    return unit;
}

export async function update(actor, unitId, updates = {}) {
    requireObjectId(unitId, 'Unit id');

    const unit = await Unit.findById(unitId);
    if (!unit) throw new ApiError(404, 'Unit not found');

    assertPropertyAccess(actor, unit.propertyId);
    await assertPermission(actor, unit.propertyId, 'canManageUnits');

    const set = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) set[field] = updates[field];
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported unit fields were provided');
    }

    if (set.unitNumber && set.unitNumber !== unit.unitNumber) {
        const duplicate = await Unit.exists({
            propertyId: unit.propertyId,
            unitNumber: set.unitNumber,
            _id: { $ne: unit._id },
        });
        if (duplicate) throw new ApiError(409, `Unit ${set.unitNumber} already exists in this property`);
    }

    const updated = await Unit.findByIdAndUpdate(unit._id, { $set: set }, { new: true, runValidators: true });
    await refreshPropertyCounters(updated.propertyId);

    return updated;
}
