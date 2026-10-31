import { z } from 'zod';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const url = z.string().trim().regex(URL_PATTERN, 'Must be an http(s) URL');
const money = z.number().min(0);

const coordinatesValidator = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});

const addressValidator = z.object({
    street: z.string().trim().min(1).max(200),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    zip: z.string().trim().min(1).max(20),
    country: z.string().trim().length(2).optional(),
    coordinates: coordinatesValidator.optional(),
});

const settingsValidator = z.object({
    rentCurrency: z.string().trim().length(3).optional(),
    rentDueDay: z.number().int().min(1).max(31).optional(),
    lateFeeAmount: money.optional(),
    lateFeeType: z.enum(['fixed', 'percentage']).optional(),
    gracePeriodDays: z.number().int().min(0).max(60).optional(),
    securityDepositAmount: money.optional(),
    autoNotifyResidents: z.boolean().optional(),
    announcementChannels: z.array(z.enum(['push', 'email', 'sms'])).optional(),
    requestCategories: z.array(z.enum([
        'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'other',
    ])).optional(),
    autoAssignVendor: z.boolean().optional(),
    jurisdiction: z.string().trim().max(20).optional(),
    licenseNumber: z.string().trim().max(60).optional(),
    taxId: z.string().trim().max(60).optional(),
});

const propertyType = z.enum(['apartment', 'house', 'condo', 'townhouse', 'commercial', 'mixed']);
const propertyStatus = z.enum(['active', 'inactive', 'under_maintenance', 'pending']);

export const createPropertyValidator = z.object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    type: propertyType,
    address: addressValidator,
    settings: settingsValidator.optional(),
    coverImageUrl: url.or(z.literal('')).optional(),
    galleryUrls: z.array(url).max(30).optional(),
    status: propertyStatus.optional(),
});

export const updatePropertyValidator = z.object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    type: propertyType.optional(),
    address: addressValidator.partial().optional(),
    settings: settingsValidator.partial().optional(),
    coverImageUrl: url.or(z.literal('')).optional(),
    galleryUrls: z.array(url).max(30).optional(),
    status: propertyStatus.optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});
