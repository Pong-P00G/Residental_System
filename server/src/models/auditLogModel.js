import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    // Actor
    userId: { type: String, index: true }, // null for system events
    userRole: {
        type: String,
        enum: ['user', 'owner', 'admin', 'system', 'webhook', ''],
        default: ''
    },

    // Action
    action: {
        type: String,
        enum: [
            'CREATE', 'READ', 'UPDATE', 'DELETE',
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
            'PASSWORD_RESET', 'ROLE_CHANGED',
            'PAYMENT_PROCESSED', 'PAYMENT_REFUNDED',
            'REQUEST_STATUS_CHANGED', 'LEASE_SIGNED',
            'EXPORT', 'BULK_UPDATE', 'SETTINGS_CHANGED'
        ],
        required: true
    },

    // Target
    resource: {
        type: String,
        enum: ['user', 'property', 'unit', 'resident', 'lease', 'request', 'payment', 'document', 'vendor', 'compliance', 'system'],
        required: true
    },
    resourceId: { type: String, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, index: true },

    // Change details
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
        fields: [String]
    },

    // Context
    ipAddress: { type: String },
    userAgent: { type: String },
    endpoint: { type: String }, // /api/v1/requests/:id
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
    statusCode: { type: Number },

    // Risk
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    reason: { type: String }, // why this action was taken

    createdAt: { type: Date, default: Date.now, immutable: true }

}, { timestamps: false });

// Indexes for security queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ riskLevel: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // time-series queries

// TTL: keep for 2 years (compliance)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);