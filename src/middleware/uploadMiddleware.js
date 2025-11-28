const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// 1. Configure Multer to store files in memory (buffer)
const storage = multer.memoryStorage();
exports.multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image mime types
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// 2. Middleware to handle the upload to Cloudinary after Multer runs
exports.uploadToCloudinary = async (req, res, next) => {
  // Check if Multer processed a file
  if (!req.file) {
    // No file provided, proceed to the next middleware/controller
    return next();
  }

  try {
    // req.file.buffer contains the image data from multer
    const fileUrl = await uploadToCloudinary(req.file.buffer);
    
    // Attach the secure Cloudinary URL to the request body for the controller to save
    req.fileUrl = fileUrl; 
    
    next();
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return res.status(500).json({ success: false, error: 'Image upload failed.' });
  }
};