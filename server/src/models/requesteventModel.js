import mongoose from 'mongoose';

const requestEventSchema = new mongoose.Schema({
    // Reference
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
        index: true
    },

    // Actor
    actorId: { type: String, required: true }, // User.uid
    actorRole: {
        type: String,
        enum: ['resident', 'manager', 'vendor', 'system', 'webhook'],
        required: true
    },
    actorName: { type: String, default: '' }, // denormalized for display

    // Transition
    fromStatus: {
        type: String,
        enum: ['submitted', 'triaged', 'scheduled', 'in_progress', 'resolved', 'closed', 'cancelled', ''],
        default: ''
    },
    toStatus: {
        type: String,
        enum: ['submitted', 'triaged', 'scheduled', 'in_progress', 'resolved', 'closed', 'cancelled'],
        required: true
    },

    // Context
    reason: { type: String, maxlength: 1000 },
    metadata: {
        scheduledDate: Date,
        vendorId: mongoose.Schema.Types.ObjectId,
        cost: Number,
        evidenceUrls: [String],
        ipAddress: String,
        userAgent: String
    },

    // Immutable timestamp
    createdAt: { type: Date, default: Date.now, immutable: true }

}, { timestamps: false }); // only createdAt

// Indexes
requestEventSchema.index({ requestId: 1, createdAt: -1 });
requestEventSchema.index({ actorId: 1, createdAt: -1 });
requestEventSchema.index({ fromStatus: 1, toStatus: 1 });

export const RequestEvent = mongoose.model('RequestEvent', requestEventSchema);