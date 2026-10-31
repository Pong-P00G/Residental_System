import { Property } from '../models/propertyModel.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPropertyAccess, requireObjectId } from '../utils/propertyAccess.js';

const UPDATABLE_FIELDS = [
    'name', 'description', 'type', 'address', 'settings', 'coverImageUrl', 'galleryUrls', 'status',
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function list(actor, query = {}) {
    const { status, type, city, search } = query;
    const filter = {};

    if (!actor.isAdmin) {
        filter._id = { $in: actor.accessiblePropertyIds };
    }
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (city) filter['address.city'] = new RegExp(escapeRegex(city), 'i');
    if (search) filter.name = new RegExp(escapeRegex(search), 'i');

    return paginate(Property, filter, { ...pagination(query), sort: { createdAt: -1 } });
}

export async function create(actor, data) {
    return Property.create({
        ...data,
        createdBy: actor.user.firebaseUid,
    });
}

export async function getById(actor, propertyId) {
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, 'Property not found');

    return property;
}

export async function update(actor, propertyId, updates = {}) {
    requireObjectId(propertyId, 'Property id');
    assertPropertyAccess(actor, propertyId);

    const set = {};

    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] === undefined) continue;

        // Nested objects are merged field by field instead of replacing the object,
        // so a partial address/settings update keeps the existing values.
        if (field === 'address' || field === 'settings') {
            for (const [key, value] of Object.entries(updates[field])) {
                set[`${field}.${key}`] = value;
            }
        } else {
            set[field] = updates[field];
        }
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported property fields were provided');
    }

    const property = await Property.findByIdAndUpdate(
        propertyId,
        { $set: set },
        { new: true, runValidators: true }
    );
    if (!property) throw new ApiError(404, 'Property not found');

    return property;
}
