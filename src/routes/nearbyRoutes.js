const express = require('express');
const { getNearbyPlaces } = require('../controllers/nearbyController.js ');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/nearby?lat=xxx&lng=yyy
router.get('/', protect, getNearbyPlaces);

module.exports = router;