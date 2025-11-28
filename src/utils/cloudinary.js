const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Configure Cloudinary with credentials from .env
// We rely on the global dotenv.config() call in server.js to load environment variables.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer (image) to Cloudinary.
 * @param {Buffer} fileBuffer - The image file buffer from Multer.
 * @returns {string} The secure URL of the uploaded image.
 */
exports.uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        // Convert the buffer to a Base64 data URI string for Cloudinary
        const dataUri = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        cloudinary.uploader.upload(dataUri, {
            folder: 'petcare/profiles', // Specific folder
            resource_type: 'image',
            quality: 'auto:low' // Optimized quality
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(error);
            }
            // Resolve with the secure URL
            resolve(result.secure_url);
        });
    });
};