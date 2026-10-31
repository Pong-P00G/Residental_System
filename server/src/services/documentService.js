import { Document as DocumentModel } from '../models/documentModel.js';
import { Lease } from '../models/leaseModel.js';
import { Unit } from '../models/unitModel.js';
import ApiError from '../utils/apiError.js';
import { paginate, pagination } from '../utils/pagination.js';
import { assertPermission, assertPropertyAccess, propertyScope, requireObjectId } from '../utils/propertyAccess.js';

const RESIDENT_VISIBILITIES = ['private', 'resident'];
const UPDATABLE_FIELDS = ['name', 'category', 'visibility'];

const loadDocument = async (documentId) => {
    requireObjectId(documentId, 'Document id');
    const document = await DocumentModel.findById(documentId);
    if (!document) throw new ApiError(404, 'Document not found');
    return document;
};

const inPropertyScope = (actor, propertyId) => {
    if (!propertyId) return false;
    return actor.accessiblePropertyIds.includes(String(propertyId));
};

/**
 * Visibility rules:
 *  private  — uploader and admins only
 *  resident — the named resident, property managers, admins
 *  manager  — property managers and admins
 *  admin    — admins only
 *  public   — any authenticated user
 */
const assertDocumentAccess = (actor, document) => {
    const uid = actor.user.firebaseUid;

    if (actor.user.role === 'admin') return;
    if (document.ownerId === uid || document.uploadedBy === uid) return;
    if (document.visibility === 'public') return;

    const isManager = actor.user.role === 'owner' && inPropertyScope(actor, document.propertyId);

    if (document.visibility === 'resident' && document.residentId === uid) return;
    if (document.visibility === 'resident' && isManager) return;
    if (document.visibility === 'manager' && isManager) return;

    throw new ApiError(403, 'You do not have access to this document');
};

const visibleFilter = (actor) => {
    const uid = actor.user.firebaseUid;

    if (actor.user.role === 'admin') return {};

    const base = [{ ownerId: uid }, { uploadedBy: uid }, { visibility: 'public' }];

    if (actor.user.role === 'owner') {
        base.push({ visibility: { $in: ['resident', 'manager'] }, ...propertyScope(actor) });
    } else {
        base.push({ visibility: 'resident', residentId: uid });
    }

    return { $or: base };
};

const serialize = (document) => {
    const payload = document.toObject();
    if (payload.signedUrl && payload.signedUrlExpiresAt && payload.signedUrlExpiresAt <= new Date()) {
        delete payload.signedUrl;
        delete payload.signedUrlExpiresAt;
    }
    return payload;
};

export async function list(actor, query = {}) {
    const { propertyId, unitId, residentId, leaseId, category } = query;
    const filter = { ...visibleFilter(actor) };

    if (propertyId) {
        requireObjectId(propertyId, 'Property id');
        assertPropertyAccess(actor, propertyId);
        filter.propertyId = propertyId;
    }
    if (unitId) filter.unitId = unitId;
    if (leaseId) filter.leaseId = leaseId;
    if (category) filter.category = category;
    if (residentId && actor.user.role !== 'user') filter.residentId = residentId;

    const result = await paginate(DocumentModel, filter, {
        ...pagination(query),
        sort: { uploadedAt: -1 },
    });

    return { ...result, items: result.items.map(serialize) };
}

export async function create(actor, data) {
    const body = { ...data };
    const isResident = actor.user.role === 'user';

    if (body.propertyId) {
        requireObjectId(body.propertyId, 'Property id');
        assertPropertyAccess(actor, body.propertyId);
    }

    if (body.unitId) {
        if (!body.propertyId) throw new ApiError(400, 'propertyId is required when unitId is provided');
        const unit = await Unit.findOne({ _id: body.unitId, propertyId: body.propertyId }).select('_id');
        if (!unit) throw new ApiError(400, 'Unit does not belong to the given property');
    }

    if (body.leaseId) {
        const lease = await Lease.findById(body.leaseId).select('propertyId');
        if (!lease) throw new ApiError(400, 'Lease not found');
        if (body.propertyId && String(lease.propertyId) !== String(body.propertyId)) {
            throw new ApiError(400, 'Lease does not belong to the given property');
        }
    }

    if (isResident) {
        if (body.residentId && body.residentId !== actor.user.firebaseUid) {
            throw new ApiError(403, 'You can only upload documents for yourself');
        }
        if (body.visibility && !RESIDENT_VISIBILITIES.includes(body.visibility)) {
            throw new ApiError(403, 'Residents can only set private or resident visibility');
        }
        body.visibility = body.visibility || 'private';
        body.residentId = actor.user.firebaseUid;
    } else if (body.propertyId) {
        await assertPermission(actor, body.propertyId, 'canUploadDocuments');
    }

    const document = await DocumentModel.create({
        ...body,
        ownerId: actor.user.firebaseUid,
        uploadedBy: actor.user.firebaseUid,
        uploadedAt: new Date(),
    });

    return serialize(document);
}

export async function getById(actor, documentId) {
    const document = await loadDocument(documentId);
    assertDocumentAccess(actor, document);

    return serialize(document);
}

export async function update(actor, documentId, updates = {}) {
    const document = await loadDocument(documentId);
    const isUploader = document.ownerId === actor.user.firebaseUid || document.uploadedBy === actor.user.firebaseUid;

    if (!isUploader) {
        if (actor.user.role === 'user') {
            throw new ApiError(403, 'You can only update your own documents');
        }
        if (!document.propertyId) throw new ApiError(403, 'You do not have access to this document');
        assertPropertyAccess(actor, document.propertyId);
        await assertPermission(actor, document.propertyId, 'canUploadDocuments');
    }

    const set = {};
    for (const field of UPDATABLE_FIELDS) {
        if (updates[field] !== undefined) set[field] = updates[field];
    }

    if (Object.keys(set).length === 0) {
        throw new ApiError(400, 'No supported document fields were provided');
    }

    if (actor.user.role === 'user' && set.visibility && !RESIDENT_VISIBILITIES.includes(set.visibility)) {
        throw new ApiError(403, 'Residents can only set private or resident visibility');
    }

    const updated = await DocumentModel.findByIdAndUpdate(document._id, { $set: set }, { new: true, runValidators: true });

    return serialize(updated);
}

// Removes the metadata record; the storage object must be cleaned up separately.
export async function remove(actor, documentId) {
    const document = await loadDocument(documentId);
    const isUploader = document.ownerId === actor.user.firebaseUid || document.uploadedBy === actor.user.firebaseUid;

    if (!isUploader) {
        if (actor.user.role === 'user') {
            throw new ApiError(403, 'You can only delete your own documents');
        }
        if (!document.propertyId) throw new ApiError(403, 'You do not have access to this document');
        assertPropertyAccess(actor, document.propertyId);
        await assertPermission(actor, document.propertyId, 'canUploadDocuments');
    }

    await DocumentModel.deleteOne({ _id: document._id });

    return { id: document._id };
}
