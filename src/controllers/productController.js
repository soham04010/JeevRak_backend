const Product = require('../models/Product');


// @desc    Fetch all products
exports.getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: { $regex: req.query.keyword, $options: 'i' }
        } : {};
        const products = await Product.find({ ...keyword });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Fetch single product
exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404).json({ success: false, error: 'Product not found' });
    }
};

// @desc    Create a product
exports.createProduct = async (req, res) => {
    try {
        const { 
            name, price, description, brand, category, countInStock,
            sellerAddress, sellerContact, sellerEmail 
        } = req.body;
        
        // Get the array of URLs from middleware, or fallback
        const images = req.imageUrls && req.imageUrls.length > 0 
            ? req.imageUrls 
            : ['https://placehold.co/600x400?text=No+Image'];

        const product = new Product({
            user: req.user._id,
            name,
            price,
            images, // Save array
            brand,
            category,
            countInStock,
            description,
            sellerAddress,
            sellerContact,
            sellerEmail,
            numReviews: 0,
        });

        const createdProduct = await product.save();
        res.status(201).json({ success: true, data: createdProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Product creation failed' });
    }
};

// Add other exports (getProducts, etc) back if you are copy-pasting the whole file
exports.getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            name: { $regex: req.query.keyword, $options: 'i' }
        } : {};
        const products = await Product.find({ ...keyword });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404).json({ success: false, error: 'Product not found' });
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Use findByIdAndDelete directly or product.deleteOne() depending on Mongoose version
            await Product.deleteOne({ _id: req.params.id }); 
            res.json({ success: true, message: 'Product removed' });
        } else {
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};