import mongoose from 'mongoose';

const propertyMemberSchema = new mongoose.Schema({
    // References
    userId: { type: String, required: true, index: true }, // matches User.uid
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },

    // Scoped role on this property
    propertyRole: {
        type: String,
        enum: ['resident', 'manager', 'owner'],
        required: true
    },

    // Granular permissions (override role defaults)
    permissions: {
        canViewResidents: { type: Boolean, default: false },
        canEditResidents: { type: Boolean, default: false },
        canViewLedger: { type: Boolean, default: false },
        canRecordPayments: { type: Boolean, default: false },
        canManageRequests: { type: Boolean, default: false },
        canManageUnits: { type: Boolean, default: false },
        canManageLeases: { type: Boolean, default: false },
        canManageVendors: { type: Boolean, default: false },
        canUploadDocuments: { type: Boolean, default: false },
        canSendAnnouncements: { type: Boolean, default: false },
        canExportReports: { type: Boolean, default: false }
    },

    // Assignment metadata
    assignedBy: { type: String, required: true }, // admin or owner uid
    assignedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // for temporary access

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'removed'],
        default: 'pending'
    }

}, { timestamps: true });

// Compound indexes for fast RBAC lookups
propertyMemberSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
propertyMemberSchema.index({ propertyId: 1, propertyRole: 1 });
propertyMemberSchema.index({ userId: 1, status: 1 });

// Static: get user's accessible property IDs
propertyMemberSchema.statics.getAccessiblePropertyIds = async function (userId, role) {
    if (role === 'admin') {
        // Admin sees all properties
        const Property = mongoose.model('Property');
        const properties = await Property.find({ status: 'active' }).select('_id');
        return properties.map(p => p._id.toString());
    }
    // Owner / User sees only assigned properties
    const memberships = await this.find({
        userId,
        status: 'active',
        propertyRole: { $in: role === 'owner' ? ['manager', 'owner'] : ['resident'] }
    }).select('propertyId');
    return memberships.map(m => m.propertyId.toString());
};

// Static: check permission
propertyMemberSchema.statics.hasPermission = async function (userId, propertyId, permissionKey) {
    const member = await this.findOne({ userId, propertyId, status: 'active' });
    if (!member) return false;
    return member.permissions[permissionKey] === true;
};

export const PropertyMember = mongoose.model('PropertyMember', propertyMemberSchema);