import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    ownerId: { type: String, required: true, index: true },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        index: true
    },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    residentId: { type: String },
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease' },

    category: {
        type: String,
        enum: ['lease', 'identity', 'inspection', 'receipt', 'invoice', 'compliance', 'announcement', 'other'],
        required: true
    },
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },

    // Firebase Storage reference
    storagePath: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    signedUrl: { type: String }, // temporary access URL
    signedUrlExpiresAt: { type: Date },

    // Access control
    visibility: {
        type: String,
        enum: ['private', 'resident', 'manager', 'admin', 'public'],
        default: 'private'
    },

    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

documentSchema.index({ propertyId: 1, category: 1 });
documentSchema.index({ ownerId: 1, category: 1 });

export const Document = mongoose.model('Document', documentSchema);