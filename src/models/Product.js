const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    imageUrl: {
        type: String,
        default: 'https://placehold.co/600x400/CCCCCC/000000?text=Pet+Product'
    },
    category: {
        type: String,
        enum: ['medication', 'food', 'accessories', 'supplements'],
        default: 'medication'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);