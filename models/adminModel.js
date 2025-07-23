import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: true,
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiration: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

// ✅ FIXED: Only hash password if modified
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔐 Password comparison
adminSchema.methods.comparePassword = async function (userPassword) {
    try {
        return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw error;
    }
};

// 🔁 Generate password reset token
adminSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = resetToken;
    this.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    return resetToken;
};

const adminModel = mongoose.model('Admin', adminSchema);
export default adminModel;
