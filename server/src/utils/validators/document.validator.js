import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');
const url = z.string().trim().regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');

const category = z.enum([
    'lease', 'identity', 'inspection', 'receipt', 'invoice', 'compliance', 'announcement', 'other',
]);
const visibility = z.enum(['private', 'resident', 'manager', 'admin', 'public']);

export const createDocumentValidator = z.object({
    propertyId: objectId.optional(),
    unitId: objectId.optional(),
    residentId: z.string().trim().min(1).max(128).optional(),
    leaseId: objectId.optional(),
    category,
    name: z.string().trim().min(1).max(200),
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string().trim().min(3).max(120),
    // 50 MB ceiling; the file itself lives in Firebase Storage
    sizeBytes: z.number().int().min(0).max(50 * 1024 * 1024),
    storagePath: z.string().trim().min(1).max(500),
    downloadUrl: url,
    signedUrl: url.optional(),
    signedUrlExpiresAt: z.coerce.date().optional(),
    visibility: visibility.optional(),
});

export const updateDocumentValidator = z.object({
    name: z.string().trim().min(1).max(200).optional(),
    category: category.optional(),
    visibility: visibility.optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});
