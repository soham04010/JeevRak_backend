const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { multerUpload, uploadMultipleToCloudinary } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(
        protect, 
        authorize('admin', 'consultant', 'user'), // <--- CRITICAL: Ensure 'user' is here
        multerUpload.array('images', 8), 
        uploadMultipleToCloudinary, 
        createProduct
    );

router.route('/:id')
    .get(getProductById)
    .delete(
        protect, 
        authorize('admin'), // STRICTLY ADMIN ONLY
        deleteProduct
    ); 

module.exports = router;