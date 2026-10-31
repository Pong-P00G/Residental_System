import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
    {
        // Firebase identity — the source of truth for authentication
        firebaseUid: { type: String, required: true, unique: true, trim: true },

        // Contact identifiers
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
        },
        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // unique only when present, so users without a phone can coexist
            match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 required)'],
        },
        photoURL: { type: String, trim: true, default: '' },
        emailVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },

        // Auth providers (Firebase can link multiple)
        providers: [{
            type: String,
            enum: ['password', 'google.com', 'facebook.com', 'apple.com', 'phone'],
        }],

        // RBAC & access control
        role: {
            type: String,
            enum: ['user', 'owner', 'admin'],
            default: 'user',
            index: true,
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'deactivated'],
            default: 'active',
            index: true,
        },

        // Soft delete
        deletedAt: { type: Date, default: null, index: true },

        // Property access (quick reference, mirrors property_members junction)
        propertyIds: [{
            type: Schema.Types.ObjectId,
            ref: 'Property',
        }],

        // Profile
        bio: { type: String, maxlength: 500 },

        // Preferences
        preferences: {
            theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
            currency: { type: String, default: 'USD' },
            language: { type: String, default: 'en' },
            timezone: { type: String, default: 'UTC' },
            notifications: {
                push: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                requestUpdates: { type: Boolean, default: true },
                paymentReminders: { type: Boolean, default: true },
                announcements: { type: Boolean, default: true },
            },
        },

        // Identity verification (KYC for compliance)
        identityVerified: { type: Boolean, default: false },
        identityDocUrl: { type: String, default: '' },

        // Payment methods (tokenized — no raw card data)
        paymentMethods: [{
            provider: { type: String, enum: ['qr', 'cash', 'card', 'bank_transfer'] },
            token: { type: String },
            last4: { type: String },
            brand: { type: String },
            expiryMonth: { type: String },
            expiryYear: { type: String },
            isDefault: { type: Boolean, default: false },
            addedAt: { type: Date, default: Date.now },
        }],

        // Onboarding
        onboardingStatus: {
            type: String,
            enum: ['pending', 'profile_complete', 'property_assigned', 'completed'],
            default: 'pending',
        },

        // Security tracking
        lastLoginAt: { type: Date },
        lastLoginIp: { type: String },
        loginCount: { type: Number, default: 0, min: 0 },
        emailChangedAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.__v;
                // Never expose stored payment provider tokens
                ret.paymentMethods = (ret.paymentMethods || []).map(({ token, ...method }) => method);
                return ret;
            },
        },
    }
);

// Compound indexes (single-field unique indexes above cover id lookups)
userSchema.index({ status: 1, role: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('isActive').get(function () {
    return this.status === 'active' && !this.deletedAt;
});

// Statics
userSchema.statics.findByRole = function (role, limit = 50) {
    return this.find({ role, status: 'active', deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(limit);
};

userSchema.statics.findByFirebaseUid = function (firebaseUid) {
    return this.findOne({ firebaseUid, deletedAt: null });
};

userSchema.statics.findActiveByEmail = function (email) {
    return this.findOne({ email: String(email).toLowerCase(), deletedAt: null });
};

// Methods
userSchema.methods.recordLogin = function (ipAddress) {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.loginCount += 1;
    return this.save({ validateBeforeSave: false });
};

userSchema.methods.softDelete = function () {
    this.status = 'deactivated';
    this.deletedAt = new Date();
    return this.save({ validateBeforeSave: false });
};

export default mongoose.model('User', userSchema);
