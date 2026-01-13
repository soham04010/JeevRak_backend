const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        default: () => require('uuid').v4() 
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address' ]
    },
    mobile: {
        type: String,
        required: [true, 'Please add a 10-digit mobile number'],
        // Validates 10 digits starting with 6-9
        match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit mobile number']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false 
    },
    // Structured Address as requested
    role: {
        type: String,
        enum: ['user', 'consultant', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: 'default-user'
    },
    expertise: { type: [String], default: [] },
    bio: { type: String, maxlength: 500 }
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = mongoose.model('User', UserSchema);