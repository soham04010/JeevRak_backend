const express = require('express');
// Destructure the exactly exported functions from the controller
const { register, login, getMe, sendOTP } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);

// Private routes
router.get('/me', protect, getMe); 

module.exports = router;