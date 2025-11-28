const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error retrieving products.' });
    }
};

// @desc    Add a new product
// @route   POST /api/products
// @access  Private/Consultant (or Admin)
exports.addProduct = async (req, res) => {
    // Only consultants (or admins) should be able to do this. The route should use authorize('consultant').
    try {
        const product = await Product.create({
            ...req.body,
            createdBy: req.user.id // ID of the user creating the product
        });
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: 'Server Error adding product.' });
    }
};
// You can add update and delete logic here (e.g., updateProduct, deleteProduct)