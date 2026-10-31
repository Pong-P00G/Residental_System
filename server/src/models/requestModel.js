import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
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

    // Request details
    title: { type: String, required: true, minlength: 5, maxlength: 200 },
    description: { type: String, required: true, minlength: 10, maxlength: 2000 },
    category: {
        type: String,
        enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'lock_security', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'medium',
        index: true
    },

    // Status
    status: {
        type: String,
        enum: ['submitted', 'triaged', 'scheduled', 'in_progress', 'resolved', 'closed', 'cancelled'],
        default: 'submitted',
        index: true
    },

    // Assignment
    assignedTo: { type: String }, // manager or vendor userId
    assignedToType: {
        type: String,
        enum: ['manager', 'vendor', ''],
        default: ''
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },

    // Scheduling
    scheduledDate: { type: Date },
    scheduledTimeSlot: { type: String }, // "09:00-12:00"
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },

    // Evidence
    evidenceUrls: [{
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: String
    }],
    resolutionUrls: [{
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: String
    }],

    // Comments (resident/manager conversation)
    comments: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        authorId: { type: String, required: true },
        authorRole: { type: String, enum: ['resident', 'manager', 'vendor', 'system'] },
        content: { type: String, required: true, maxlength: 2000 },
        isInternal: { type: Boolean, default: false }, // hidden from resident
        createdAt: { type: Date, default: Date.now }
    }],

    // Resident satisfaction
    residentRating: { type: Number, min: 1, max: 5 },
    residentFeedback: { type: String, maxlength: 1000 },

    // Timestamps
    submittedAt: { type: Date, default: Date.now },
    triagedAt: { type: Date },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },

    // Metadata
    source: {
        type: String,
        enum: ['mobile_app', 'web_app', 'telegram', 'messenger', 'phone', 'email', 'system'],
        default: 'mobile_app'
    },

    // Soft delete — deleted requests stay for audit history but are hidden from queries
    deletedAt: { type: Date, default: null, index: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes
requestSchema.index({ propertyId: 1, status: 1 });
requestSchema.index({ propertyId: 1, priority: 1 });
requestSchema.index({ residentId: 1, createdAt: -1 });
requestSchema.index({ assignedTo: 1, status: 1 });
requestSchema.index({ category: 1, status: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ propertyId: 1, deletedAt: 1 });

export const Request = mongoose.model('Request', requestSchema);