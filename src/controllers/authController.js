const User = require('../models/User');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

// Setup the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const userData = {
        _id: user._id,
        userId: user.userId, 
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        role: user.role,
        profilePicture: user.profilePicture,
        expertise: user.expertise,
        bio: user.bio,
    };
    res.status(statusCode).json({ success: true, token, user: userData });
};

// @desc    Send OTP to Email
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, error: 'Email already registered.' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await OTP.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true });

        await transporter.sendMail({
            from: `"JeevRak PetCare" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code",
            html: `<h3>Welcome to JeevRak!</h3><p>Your 4-digit verification code is: <b>${otp}</b></p>`
        });

        res.status(200).json({ success: true, message: 'OTP sent to email.' });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ success: false, error: 'Failed to send OTP. Check backend email credentials.' });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, mobile, address, role, expertise, bio, otp } = req.body;

        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) return res.status(400).json({ success: false, error: 'Invalid or expired code.' });

        const user = await User.create({
            name, email, password, mobile, address, role, bio,
            expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map(e => e.trim()) : []),
            isVerified: true
        });

        await OTP.deleteOne({ _id: otpRecord._id });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error: 'Login failed.' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};