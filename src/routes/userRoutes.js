const express = require('express');
const { 
    getConsultants, 
    updateUserProfile 
} = require('../controllers/userController'); // Renamed controller import
const { protect, authorize } = require('../middleware/authMiddleware');
const { multerUpload, uploadToCloudinary } = require('../middleware/uploadMiddleware');

const router = express.Router();

// --- Authentication Middleware Applied ---
router.use(protect);

// @route   GET /api/users/consultants
// @desc    Get all consultants (with filtering/search)
// @access  Private (Requires login)
router.get('/consultants', getConsultants);

// @route   PUT /api/users/:id
// @desc    Update user or consultant profile (including profile picture)
// @access  Private (User can only update their own profile)
router.put(
    '/:id',
    multerUpload.single('profilePicture'), // 1. Multer processes the file and saves buffer
    uploadToCloudinary, // 2. Uploads to Cloudinary and attaches URL to req.fileUrl
    updateUserProfile // 3. Controller saves URL and other profile data
);

module.exports = router;