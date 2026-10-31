import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');
const url = z.string().trim().regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');

const chargesValidator = z.array(z.object({
    name: z.string().trim().min(1).max(100),
    amount: z.number().min(0),
    frequency: z.enum(['one_time', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly']).optional(),
    type: z.enum(['utility', 'fee', 'service', 'penalty', 'other']).optional(),
    isMandatory: z.boolean().optional(),
    description: z.string().trim().max(300).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
})).max(30);

const leaseType = z.enum(['fixed_term', 'month_to_month', 'week_to_week']);
const rentFrequency = z.enum(['weekly', 'bi_weekly', 'monthly', 'quarterly']);
const leaseStatus = z.enum([
    'draft', 'sent', 'signed', 'active', 'expiring', 'expired', 'terminated', 'renewed',
]);

export const createLeaseValidator = z.object({
    propertyId: objectId,
    unitId: objectId,
    primaryResidentId: z.string().trim().min(1).max(128),
    coResidentIds: z.array(z.string().trim().min(1).max(128)).max(10).optional(),
    leaseType: leaseType.optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    renewalDate: z.coerce.date().optional(),
    noticePeriodDays: z.number().int().min(0).max(365).optional(),
    rentAmount: z.number().min(0),
    rentFrequency: rentFrequency.optional(),
    depositAmount: z.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    charges: chargesValidator.optional(),
    leaseDocumentUrl: url.or(z.literal('')).optional(),
    signedDocumentUrl: url.or(z.literal('')).optional(),
    status: leaseStatus.optional(),
    notes: z.string().trim().max(2000).optional(),
}).refine((value) => !value.endDate || value.endDate > value.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
});

export const updateLeaseValidator = z.object({
    leaseType: leaseType.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().nullable().optional(),
    renewalDate: z.coerce.date().nullable().optional(),
    noticePeriodDays: z.number().int().min(0).max(365).optional(),
    rentAmount: z.number().min(0).optional(),
    rentFrequency: rentFrequency.optional(),
    depositAmount: z.number().min(0).optional(),
    depositHeld: z.number().min(0).optional(),
    depositStatus: z.enum(['pending', 'held', 'partially_refunded', 'fully_refunded', 'forfeited']).optional(),
    currency: z.string().trim().length(3).optional(),
    charges: chargesValidator.optional(),
    leaseDocumentUrl: url.or(z.literal('')).optional(),
    signedDocumentUrl: url.or(z.literal('')).optional(),
    signedAt: z.coerce.date().optional(),
    status: leaseStatus.optional(),
    terminationReason: z.string().trim().max(1000).optional(),
    terminationDate: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});
