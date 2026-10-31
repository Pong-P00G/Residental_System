import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    // Basic info
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    type: {
        type: String,
        enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial', 'mixed'],
        required: true
    },

    // Address (structured for compliance & search)
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US' },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },

    // Settings (per-property configuration)
    settings: {
        // Rent & fees
        rentCurrency: { type: String, default: 'USD' },
        rentDueDay: { type: Number, default: 1, min: 1, max: 31 },
        lateFeeAmount: { type: Number, default: 0 },
        lateFeeType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
        gracePeriodDays: { type: Number, default: 5 },
        securityDepositAmount: { type: Number, default: 0 },

        // Notifications
        autoNotifyResidents: { type: Boolean, default: true },
        announcementChannels: [{
            type: String,
            enum: ['push', 'email', 'sms']
        }],

        // Maintenance
        requestCategories: [{
            type: String,
            enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'other']
        }],
        autoAssignVendor: { type: Boolean, default: false },
        defaultVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },

        // Compliance
        jurisdiction: { type: String, default: '' }, // e.g. "US-CA", "UK-LON"
        licenseNumber: { type: String, default: '' },
        taxId: { type: String, default: '' }
    },

    // Media
    coverImageUrl: { type: String, default: '' },
    galleryUrls: [{ type: String }],

    // Counters (updated by middleware or functions)
    totalUnits: { type: Number, default: 0 },
    occupiedUnits: { type: Number, default: 0 },
    vacantUnits: { type: Number, default: 0 },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'under_maintenance', 'pending'],
        default: 'active',
        index: true
    },

    // Metadata
    createdBy: { type: String, required: true }, // admin uid
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Indexes
propertySchema.index({ 'address.city': 1, 'address.state': 1 });
propertySchema.index({ 'address.coordinates': '2dsphere' }); // geo queries
propertySchema.index({ status: 1, type: 1 });
propertySchema.index({ 'settings.jurisdiction': 1 });

export const Property = mongoose.model('Property', propertySchema);