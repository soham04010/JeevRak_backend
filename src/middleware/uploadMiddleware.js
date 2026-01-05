const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// 1. Configure Multer to store files in memory (buffer)
const storage = multer.memoryStorage();
const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});

// 2. Middleware to handle single upload (for User Profile)
const uploadSingleToCloudinary = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const fileUrl = await uploadToCloudinary(req.file.buffer);
    req.fileUrl = fileUrl; 
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Image upload failed.' });
  }
};

// 3. NEW: Middleware to handle multiple uploads (for Products)
const uploadMultipleToCloudinary = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  
  try {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
    const urls = await Promise.all(uploadPromises);
    
    req.imageUrls = urls; // Array of URLs
    next();
  } catch (error) {
    console.error("Multiple Upload Error", error);
    return res.status(500).json({ success: false, error: 'Failed to upload one or more images.' });
  }
};

module.exports = {
  multerUpload,
  uploadToCloudinary: uploadSingleToCloudinary, // Export original name for compatibility
  uploadMultipleToCloudinary // Export new one
};