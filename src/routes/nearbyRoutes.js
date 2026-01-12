const express = require('express');
// Fixed: Removed the trailing space from the require path
const { getNearbyPlaces } = require('../controllers/nearbyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/nearby?lat=xxx&lng=yyy
router.get('/', protect, getNearbyPlaces);

module.exports = router;