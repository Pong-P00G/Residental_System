import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');

const emergencyContactValidator = z.object({
    name: z.string().trim().max(120).optional(),
    phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, 'Phone must be in E.164 format').or(z.literal('')).optional(),
    relationship: z.string().trim().max(60).optional(),
});

const residentStatus = z.enum(['active', 'notice_given', 'moved_out', 'pending', 'blacklisted']);

export const createResidentValidator = z.object({
    userId: z.string().trim().min(1).max(128),
    propertyId: objectId,
    unitId: objectId,
    leaseId: objectId,
    type: z.enum(['primary', 'co_resident', 'dependent']).optional(),
    emergencyContact: emergencyContactValidator.optional(),
    moveInDate: z.coerce.date(),
    moveOutDate: z.coerce.date().nullable().optional(),
    expectedMoveOutDate: z.coerce.date().nullable().optional(),
    status: residentStatus.optional(),
    notes: z.string().trim().max(2000).optional(),
});

export const updateResidentValidator = z.object({
    unitId: objectId.optional(),
    type: z.enum(['primary', 'co_resident', 'dependent']).optional(),
    emergencyContact: emergencyContactValidator.optional(),
    moveInDate: z.coerce.date().optional(),
    moveOutDate: z.coerce.date().nullable().optional(),
    expectedMoveOutDate: z.coerce.date().nullable().optional(),
    status: residentStatus.optional(),
    notes: z.string().trim().max(2000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});
