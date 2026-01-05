const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    deleteProduct // Import the new function
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { multerUpload, uploadMultipleToCloudinary } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(
        protect, 
        authorize('admin', 'consultant'), 
        multerUpload.array('images', 8), 
        uploadMultipleToCloudinary,      
        createProduct
    );

router.route('/:id')
    .get(getProductById)
    .delete(protect, authorize('admin', 'consultant'), deleteProduct); // Add DELETE route

module.exports = router;