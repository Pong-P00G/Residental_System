import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

const preferencesValidator = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    currency: z.string().trim().min(3).max(3).optional(),
    language: z.string().trim().min(2).max(10).optional(),
    timezone: z.string().trim().min(1).max(60).optional(),
    notifications: z.object({
        push: z.boolean().optional(),
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
        requestUpdates: z.boolean().optional(),
        paymentReminders: z.boolean().optional(),
        announcements: z.boolean().optional(),
    }).optional(),
});

// Profile fields a user may change on their own account.
export const updateUserValidator = z.object({
    name: z.string().trim().min(1, 'Name is required').max(80).optional(),
    phoneNumber: z.string().trim().regex(PHONE_PATTERN, 'Phone number must be in E.164 format').nullish(),
    photoURL: z.string().trim().regex(URL_PATTERN, 'photoURL must be an http(s) URL').or(z.literal('')).optional(),
    bio: z.string().trim().max(500).optional(),
    email: z.string().trim().toLowerCase().regex(EMAIL_PATTERN, 'Invalid email address').optional(),
    preferences: preferencesValidator.optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});

// Admin-only role assignment.
export const updateUserRoleValidator = z.object({
    role: z.enum(['user', 'owner', 'admin'], { message: 'Role must be user, owner or admin' }),
});
