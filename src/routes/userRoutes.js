const express = require('express');
const { 
    getConsultants, 
    updateUserProfile,
    addAddress,
    deleteAddress
} = require('../controllers/userController'); 
const { protect } = require('../middleware/authMiddleware');
const { multerUpload, uploadToCloudinary } = require('../middleware/uploadMiddleware');

const router = express.Router();

// --- Authentication Middleware Applied ---
router.use(protect);

// @route   GET /api/users/consultants
router.get('/consultants', getConsultants);

// @route   PUT /api/users/:id
// @desc    Update profile (Handles image upload + profile data)
router.put(
    '/:id',
    multerUpload.single('profilePicture'), 
    uploadToCloudinary, 
    updateUserProfile 
);

// --- Address Management Routes ---

// @route   POST /api/users/address
// @desc    Add a new address to user profile
router.post('/address', addAddress);

// @route   DELETE /api/users/address/:addressId
// @desc    Remove an address from user profile
router.delete('/address/:addressId', deleteAddress);

module.exports = router;