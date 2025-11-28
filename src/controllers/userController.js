const User = require('../models/User');

// --- Listing Consultants ---

// @route   GET /api/users/consultants
exports.getConsultants = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { role: 'consultant' };

        if (search) {
            query.$or = [
                { expertise: { $in: [new RegExp(search, 'i')] } },
                { name: { $regex: new RegExp(search, 'i') } }
            ];
        }

        // Fetch consultants and sort them (e.g., by rating, which we'll add later)
        const consultants = await User.find(query).select('-password');

        res.status(200).json({ success: true, count: consultants.length, data: consultants });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error retrieving consultants.' });
    }
};

// --- Profile Update ---

// @route   PUT /api/users/:id
exports.updateUserProfile = async (req, res) => {
    try {
        // Ensure user is updating their own profile
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this profile.' });
        }
        
        // Fields that can be updated
        const updates = {
            name: req.body.name,
            bio: req.body.bio,
            expertise: req.body.expertise 
        };
        
        // **Crucial:** If the upload middleware provided a file URL, save it
        if (req.fileUrl) {
            updates.profilePicture = req.fileUrl;
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        console.error('Update profile error:', err.message);
        // Handle validation errors from Mongoose
        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: 'Server Error during profile update.' });
    }
};