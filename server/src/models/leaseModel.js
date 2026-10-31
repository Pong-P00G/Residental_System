import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
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
    primaryResidentId: { type: String, required: true }, // User.uid
    coResidentIds: [{ type: String }], // additional User.uids

    // Lease terms
    leaseType: {
        type: String,
        enum: ['fixed_term', 'month_to_month', 'week_to_week'],
        default: 'fixed_term'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    renewalDate: { type: Date },
    noticePeriodDays: { type: Number, default: 30 },

    // Financial terms
    rentAmount: { type: Number, required: true, min: 0 },
    rentFrequency: {
        type: String,
        enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly'],
        default: 'monthly'
    },
    depositAmount: { type: Number, default: 0 },
    depositHeld: { type: Number, default: 0 }, // actual held amount
    depositStatus: {
        type: String,
        enum: ['pending', 'held', 'partially_refunded', 'fully_refunded', 'forfeited'],
        default: 'pending'
    },
    currency: { type: String, default: 'USD' },

    // Recurring charges (utilities, fees, parking)
    charges: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true }, // "Parking", "Water", "Pet Fee"
        amount: { type: Number, required: true, min: 0 },
        frequency: {
            type: String,
            enum: ['one_time', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly'],
            default: 'monthly'
        },
        type: {
            type: String,
            enum: ['utility', 'fee', 'service', 'penalty', 'other'],
            default: 'fee'
        },
        isMandatory: { type: Boolean, default: true },
        description: { type: String },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }
    }],

    // Documents
    leaseDocumentUrl: { type: String, default: '' },
    signedDocumentUrl: { type: String, default: '' },
    signedAt: { type: Date },

    // Status
    status: {
        type: String,
        enum: ['draft', 'sent', 'signed', 'active', 'expiring', 'expired', 'terminated', 'renewed'],
        default: 'draft',
        index: true
    },

    // Termination
    terminationReason: { type: String, maxlength: 1000 },
    terminationDate: { type: Date },
    terminatedBy: { type: String },

    // Metadata
    notes: { type: String, maxlength: 2000 },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes
leaseSchema.index({ propertyId: 1, status: 1 });
leaseSchema.index({ unitId: 1, status: 1 });
leaseSchema.index({ primaryResidentId: 1, status: 1 });
leaseSchema.index({ endDate: 1 }); // for expiry notifications

export const Lease = mongoose.model('Lease', leaseSchema);