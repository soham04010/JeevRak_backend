const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes by checking for a valid JWT in the Authorization header
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in the 'Authorization' header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID and attach to request object (without password)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
             return res.status(401).json({ success: false, error: 'User belonging to this token no longer exists.' });
        }

        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ success: false, error: 'Not authorized, token failed or expired.' });
    }
};

// Grant access to specific roles (e.g., authorize('consultant', 'admin'))
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `User role '${req.user.role}' is not authorized to access this resource.`
            });
        }
        next();
    };
};