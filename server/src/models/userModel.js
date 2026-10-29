import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const PROVIDERS = ['password', 'google.com', 'facebook.com', 'phone'];

const userSchema = new Schema(
    {
        firebaseUid: { type: String, required: true, unique: true },

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
        isEmailVerified: { type: Boolean, default: false },
        phoneNumber: { type: String, trim: true, unique: true, sparse: true },
        isPhoneVerified: { type: Boolean, default: false },

        // Auth provider linked
        provider: { type: String, required: true, enum: PROVIDERS },

        // RBAC & access control
        role: {
            type: String,
            enum: ['user', 'manager', 'admin'],
            default: 'user',
            index: true,
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'deactivated'],
            default: 'active',
            index: true,
        },

        // Soft delete timestamp
        deletedAt: { type: Date, default: null },

        // Optional: Firebase handles credentials, so only keep this if you need it
        password: { type: String, minlength: 8, select: false },

        avatar: { type: String },
        bio: { type: String, maxlength: 500 },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'system',
            },
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    }
);

userSchema.virtual('profile', {
    ref: 'UserProfile',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

// Hash password before saving (only if one is set and changed)
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = function (candidate) {
    if (!this.password) return Promise.resolve(false);
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);