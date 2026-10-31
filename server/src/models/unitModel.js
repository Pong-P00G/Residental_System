import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    // References
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },

    // Unit identification
    unitNumber: { type: String, required: true }, // "101", "A", "3B"
    floor: { type: Number, default: 1 },
    label: { type: String, default: '' }, // display name

    // Unit details
    type: {
        type: String,
        enum: ['studio', '1_bedroom', '2_bedroom', '3_bedroom', '4_bedroom_plus', 'loft', 'penthouse', 'others'],
        required: true
    },
    sizeSqft: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },

    // Amenities
    amenities: {
        furnished: { type: Boolean, default: false },
        airConditioning: { type: Boolean, default: false },
        heating: { type: Boolean, default: false },
        washerDryer: { type: Boolean, default: false },
        dishwasher: { type: Boolean, default: false },
        balcony: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        petsAllowed: { type: Boolean, default: false },
        smokingAllowed: { type: Boolean, default: false },
        internetIncluded: { type: Boolean, default: false },
        waterIncluded: { type: Boolean, default: false },
        electricityIncluded: { type: Boolean, default: false },
        custom: [{ name: String, value: String }]
    },

    // Financial
    rentAmount: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, default: 0, min: 0 },
    maintenanceFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    // Media
    photos: [{ url: String, caption: String, uploadedAt: Date }],
    floorPlanUrl: { type: String, default: '' },

    // Status
    status: {
        type: String,
        enum: ['vacant', 'occupied', 'reserved', 'under_maintenance', 'inactive'],
        default: 'vacant',
        index: true
    },

    // Current occupancy (denormalized for fast reads)
    currentResidentId: { type: String, default: null }, // User.uid
    currentLeaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
        default: null
    },
    leaseStartDate: { type: Date },
    leaseEndDate: { type: Date },

    // Metadata
    notes: { type: String, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Compound indexes
unitSchema.index({ propertyId: 1, unitNumber: 1 }, { unique: true });
unitSchema.index({ propertyId: 1, status: 1 });
unitSchema.index({ propertyId: 1, rentAmount: 1 });
unitSchema.index({ currentResidentId: 1 });

export const Unit = mongoose.model('Unit', unitSchema);