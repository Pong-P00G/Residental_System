import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');
const url = z.string().trim().regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');

const amenitiesValidator = z.object({
    furnished: z.boolean().optional(),
    airConditioning: z.boolean().optional(),
    heating: z.boolean().optional(),
    washerDryer: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
    balcony: z.boolean().optional(),
    parking: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    smokingAllowed: z.boolean().optional(),
    internetIncluded: z.boolean().optional(),
    waterIncluded: z.boolean().optional(),
    electricityIncluded: z.boolean().optional(),
    custom: z.array(z.object({
        name: z.string().trim().min(1).max(60),
        value: z.string().trim().max(120),
    })).max(20).optional(),
});

export const createUnitValidator = z.object({
    propertyId: objectId,
    unitNumber: z.string().trim().min(1).max(20),
    floor: z.number().int().min(-5).max(200).optional(),
    label: z.string().trim().max(100).optional(),
    type: z.enum(['studio', '1_bedroom', '2_bedroom', '3_bedroom', '4_bedroom_plus', 'loft', 'penthouse', 'others']),
    sizeSqft: z.number().min(0).optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    bathrooms: z.number().min(0).max(20).optional(),
    amenities: amenitiesValidator.optional(),
    rentAmount: z.number().min(0),
    depositAmount: z.number().min(0).optional(),
    maintenanceFee: z.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    photos: z.array(z.object({
        url,
        caption: z.string().trim().max(200).optional(),
        uploadedAt: z.coerce.date().optional(),
    })).max(30).optional(),
    floorPlanUrl: url.or(z.literal('')).optional(),
    status: z.enum(['vacant', 'occupied', 'reserved', 'under_maintenance', 'inactive']).optional(),
    notes: z.string().trim().max(2000).optional(),
});

export const updateUnitValidator = createUnitValidator
    .omit({ propertyId: true })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Provide at least one field to update',
    });
