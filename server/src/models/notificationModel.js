import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },

    type: {
        type: String,
        enum: ['request_update', 'payment_due', 'payment_received', 'lease_expiring', 'announcement', 'system'],
        required: true
    },
    channel: {
        type: String,
        enum: ['push', 'email', 'sms', 'in_app'],
        required: true
    },

    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: String }, // deep link payload

    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
        default: 'pending'
    },
    errorMessage: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);