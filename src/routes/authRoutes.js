const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Register a user or consultant
// @route   POST /api/auth/register
// @access  Public
router.post('/register', register);

// @desc    Login a user or consultant
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Get current logged in user (Check token validity)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe); 

module.exports = router;