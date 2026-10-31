import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');
const url = z.string().trim().regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');

export const createRequestValidator = z.object({
    propertyId: objectId,
    unitId: objectId,
    title: z.string().trim().min(5).max(200),
    description: z.string().trim().min(10).max(2000),
    category: z.enum([
        'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'lock_security', 'other',
    ]),
    priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
    // Managers may raise a request on behalf of a resident
    residentId: z.string().trim().min(1).max(128).optional(),
    evidenceUrls: z.array(z.object({
        url,
        caption: z.string().trim().max(200).optional(),
    })).max(10).optional(),
    source: z.enum(['mobile_app', 'web_app', 'telegram', 'messenger', 'phone', 'email', 'system']).optional(),
});

export const updateRequestStatusValidator = z.object({
    status: z.enum(['triaged', 'scheduled', 'in_progress', 'resolved', 'closed', 'cancelled']),
    reason: z.string().trim().max(1000).optional(),
    note: z.string().trim().max(2000).optional(),
    assignedTo: z.string().trim().max(128).optional(),
    assignedToType: z.enum(['manager', 'vendor']).optional(),
    scheduledDate: z.coerce.date().optional(),
    estimatedCost: z.number().min(0).optional(),
    actualCost: z.number().min(0).optional(),
});
