const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    // Unique ID for external reference (using uuid)
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
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return password by default on queries
    },
    // User or Consultant role distinction
    role: {
        type: String,
        enum: ['user', 'consultant'],
        default: 'user'
    },
    // Cloudinary URL for the profile picture
    profilePicture: {
        type: String,
        default: 'https://placehold.co/400x400/CCCCCC/000000?text=Profile' // Default placeholder
    },
    // Consultant-specific fields
    expertise: {
        type: [String], 
        required: function() { return this.role === 'consultant'; },
        default: []
    },
    bio: {
        type: String,
        maxlength: 500,
        required: function() { return this.role === 'consultant'; }
    }
}, {
    timestamps: true
});

// Mongoose middleware to hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token expires in 30 days
    });
};

module.exports = mongoose.model('User', UserSchema);