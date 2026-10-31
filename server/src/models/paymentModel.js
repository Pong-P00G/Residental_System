import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    // References
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
        index: true
    },
    residentId: { type: String, required: true, index: true }, // User.uid
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
        required: true
    },

    // Payment details
    type: {
        type: String,
        enum: ['rent', 'deposit', 'late_fee', 'maintenance_fee', 'utility', 'penalty', 'refund', 'other'],
        required: true
    },
    category: {
        type: String,
        enum: ['income', 'expense', 'refund', 'adjustment'],
        required: true
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Period this payment covers
    periodStart: { type: Date },
    periodEnd: { type: Date },
    dueDate: { type: Date },

    // Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed', 'cancelled'],
        default: 'pending',
        index: true
    },

    // Payment method
    method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'money_order', 'qr', 'stripe', 'other'],
        required: true
    },
    paymentMethodId: { type: String }, // reference to User.paymentMethods token

    // Provider details (Stripe, qr, cash, etc.)
    provider: {
        name: { type: String, enum: ['stripe', 'qr', 'bank', 'manual', ''] },
        transactionId: { type: String },
        chargeId: { type: String },
        receiptUrl: { type: String }
    },

    // Idempotency
    idempotencyKey: { type: String, unique: true, sparse: true },

    // Reconciliation
    reconciledAt: { type: Date },
    reconciledBy: { type: String },
    reconciliationNotes: { type: String },

    // Refund details
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    refundReference: { type: String },

    // Metadata
    description: { type: String, maxlength: 500 },
    notes: { type: String, maxlength: 1000 },
    recordedBy: { type: String }, // owner/admin uid, or 'system'
    source: {
        type: String,
        enum: ['mobile_app', 'web_app', 'manual_entry', 'webhook', 'scheduled'],
        default: 'mobile_app'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes
paymentSchema.index({ propertyId: 1, status: 1 });
paymentSchema.index({ residentId: 1, createdAt: -1 });
paymentSchema.index({ leaseId: 1, type: 1 });
paymentSchema.index({ dueDate: 1, status: 1 }); // for arrears queries
paymentSchema.index({ reference: 1 });
// paymentSchema.index({ 'provider.transactionId': 1 });

export const Payment = mongoose.model('Payment', paymentSchema);