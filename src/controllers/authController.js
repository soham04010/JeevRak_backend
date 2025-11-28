const User = require('../models/User');

// Helper function to send token and user response
const sendTokenResponse = (user, statusCode, res) => {
    // Only send non-sensitive fields back to the client
    const token = user.getSignedJwtToken();
    const userData = {
        _id: user._id,
        userId: user.userId, 
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        expertise: user.expertise,
        bio: user.bio,
    };

    res.status(statusCode).json({ success: true, token, user: userData });
};

// @desc    Register a new user or consultant
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, expertise, bio } = req.body;

        // Basic validation for consultant fields
        if (role === 'consultant' && (!expertise || !bio)) {
            return res.status(400).json({ success: false, error: 'Consultants must provide expertise and bio.' });
        }

        const user = await User.create({
            name, 
            email, 
            password, 
            role: role || 'user', 
            // Convert comma-separated string to array if necessary
            expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map(e => e.trim()) : []), 
            bio
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Registration error:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists.' });
        }
        res.status(500).json({ success: false, error: 'Server error during registration.' });
    }
};

// @desc    Login user or consultant
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password.' });
        }

        // Fetch password field explicitly for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, error: 'Server error during login.' });
    }
};

// @desc    Get logged in user (used after token validation)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    // req.user is set by the protect middleware (excluding password)
    res.status(200).json({ success: true, user: req.user });
};