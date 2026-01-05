const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// --- DEBUGGING BLOCK ---
if (!protect) {
    console.error("FATAL ERROR: 'protect' middleware is UNDEFINED in orderRoutes.js. Check src/middleware/authMiddleware.js");
}
if (!addOrderItems) {
    console.error("FATAL ERROR: 'addOrderItems' controller is UNDEFINED in orderRoutes.js. Check src/controllers/orderController.js");
}
if (!getMyOrders) {
    console.error("FATAL ERROR: 'getMyOrders' controller is UNDEFINED in orderRoutes.js. Check src/controllers/orderController.js");
}
// ---------------------

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);

module.exports = router;