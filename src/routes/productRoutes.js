const express = require('express');
const { getProducts, addProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All product routes require login

// @route   GET /api/products
router.get('/', getProducts);

// @route   POST /api/products
// Only consultants can add products
router.post('/', authorize('consultant'), addProduct);

module.exports = router;