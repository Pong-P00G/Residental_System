import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema({
    // References
    userId: { type: String, required: true, index: true }, // User.uid
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
    leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
        required: true
    },

    // Resident type
    type: {
        type: String,
        enum: ['primary', 'co_resident', 'dependent'],
        default: 'primary'
    },

    // Emergency contact
    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relationship: { type: String, default: '' }
    },

    // Tenancy dates
    moveInDate: { type: Date, required: true },
    moveOutDate: { type: Date },
    expectedMoveOutDate: { type: Date },

    // Status
    status: {
        type: String,
        enum: ['active', 'notice_given', 'moved_out', 'pending', 'blacklisted'],
        default: 'pending',
        index: true
    },

    // Financial snapshot (denormalized)
    balanceDue: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    lastPaymentAmount: { type: Number, default: 0 },

    // Metadata
    notes: { type: String, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes
residentSchema.index({ propertyId: 1, status: 1 });
residentSchema.index({ unitId: 1, status: 1 });
residentSchema.index({ userId: 1, status: 1 });
residentSchema.index({ moveInDate: -1 });

export const Resident = mongoose.model('Resident', residentSchema);