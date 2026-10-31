import { z } from 'zod';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().trim().regex(OBJECT_ID_PATTERN, 'Must be a valid id');
const url = z.string().trim().regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');

const paymentType = z.enum([
    'rent', 'deposit', 'late_fee', 'maintenance_fee', 'utility', 'penalty', 'refund', 'other',
]);
const paymentCategory = z.enum(['income', 'expense', 'refund', 'adjustment']);
const paymentMethod = z.enum([
    'credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'money_order', 'qr', 'stripe', 'other',
]);
const paymentStatus = z.enum([
    'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed', 'cancelled',
]);

const providerValidator = z.object({
    name: z.enum(['stripe', 'qr', 'bank', 'manual', '']).optional(),
    transactionId: z.string().trim().max(120).optional(),
    chargeId: z.string().trim().max(120).optional(),
    receiptUrl: url.optional(),
});

export const createPaymentValidator = z.object({
    propertyId: objectId,
    unitId: objectId,
    leaseId: objectId,
    residentId: z.string().trim().min(1).max(128).optional(),
    type: paymentType,
    category: paymentCategory,
    amount: z.number().positive('Amount must be greater than zero'),
    currency: z.string().trim().length(3).optional(),
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    status: paymentStatus.optional(),
    method: paymentMethod,
    paymentMethodId: z.string().trim().max(120).optional(),
    provider: providerValidator.optional(),
    idempotencyKey: z.string().trim().min(8).max(120).optional(),
    reference: z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(1000).optional(),
    source: z.enum(['mobile_app', 'web_app', 'manual_entry', 'webhook', 'scheduled']).optional(),
}).refine((value) => !value.periodEnd || !value.periodStart || value.periodEnd >= value.periodStart, {
    message: 'periodEnd must not be before periodStart',
    path: ['periodEnd'],
});

export const updatePaymentValidator = z.object({
    status: paymentStatus.optional(),
    amount: z.number().positive('Amount must be greater than zero').optional(),
    dueDate: z.coerce.date().optional(),
    reference: z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(1000).optional(),
    provider: providerValidator.partial().optional(),
    refundAmount: z.number().min(0).optional(),
    refundReason: z.string().trim().max(500).optional(),
    refundReference: z.string().trim().max(120).optional(),
    reconciled: z.boolean().optional(),
    reconciliationNotes: z.string().trim().max(1000).optional(),
    // Recorded on the resulting payment event, not stored on the payment
    reason: z.string().trim().max(1000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
});
