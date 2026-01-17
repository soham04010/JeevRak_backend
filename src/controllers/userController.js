const User = require('../models/User');

// --- Listing Consultants ---
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

        const consultants = await User.find(query).select('-password');
        res.status(200).json({ success: true, count: consultants.length, data: consultants });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error retrieving consultants.' });
    }
};

// --- Profile Update ---
exports.updateUserProfile = async (req, res) => {
    try {
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized.' });
        }
        
        const updates = {
            name: req.body.name,
            bio: req.body.bio,
            expertise: req.body.expertise,
            mobile: req.body.mobile // Support mobile update
        };
        
        if (req.fileUrl) updates.profilePicture = req.fileUrl;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Profile update failed.' });
    }
};

// --- Address Management ---
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // If this is the first address, make it default
        if (user.addresses.length === 0) req.body.isDefault = true;
        // If new address is set as default, unset others
        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(req.body);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Could not delete address.' });
    }
};