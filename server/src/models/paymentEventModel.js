import mongoose from 'mongoose';

const paymentEventSchema = new mongoose.Schema({
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
        index: true
    },

    actorId: { type: String, required: true },
    actorRole: {
        type: String,
        enum: ['resident', 'manager', 'admin', 'system', 'webhook', 'payment_provider'],
        required: true
    },

    fromStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed', 'cancelled', ''],
        default: ''
    },
    toStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed', 'cancelled'],
        required: true
    },

    reason: { type: String, maxlength: 1000 },
    metadata: {
        providerResponse: mongoose.Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String,
        refundAmount: Number
    },

    createdAt: { type: Date, default: Date.now, immutable: true }

}, { timestamps: false });

paymentEventSchema.index({ paymentId: 1, createdAt: -1 });
paymentEventSchema.index({ actorId: 1, createdAt: -1 });

export const PaymentEvent = mongoose.model('PaymentEvent', paymentEventSchema);