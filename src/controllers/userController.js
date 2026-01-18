const User = require('../models/User');

// --- Helper: Sanitize Address for Indian Context ---
const sanitizeAddressInput = (data) => {
    return {
        street: data.street ? data.street.trim() : '',
        city: data.city ? data.city.trim().charAt(0).toUpperCase() + data.city.trim().slice(1).toLowerCase() : '',
        state: data.state ? data.state.trim() : '',
        zipCode: data.zipCode ? data.zipCode.toString().replace(/\s/g, "") : '',
        isDefault: data.isDefault || false
    };
};

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
            mobile: req.body.mobile 
        };

        if (req.body.expertise) {
            if (typeof req.body.expertise === 'string') {
                try {
                    const parsed = JSON.parse(req.body.expertise);
                    updates.expertise = Array.isArray(parsed) ? parsed : req.body.expertise.split(',').map(s => s.trim());
                } catch (e) {
                    updates.expertise = req.body.expertise.split(',').map(s => s.trim());
                }
            } else {
                updates.expertise = req.body.expertise;
            }
        }
        
        if (req.fileUrl) updates.profilePicture = req.fileUrl;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Profile update failed.' });
    }
};

// --- Address Management ---
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        
        const sanitizedAddr = sanitizeAddressInput(req.body);

        if (!/^[1-9][0-9]{5}$/.test(sanitizedAddr.zipCode)) {
            return res.status(400).json({ success: false, error: 'Invalid Indian PIN Code. Must be 6 digits.' });
        }

        if (user.addresses.length === 0) sanitizedAddr.isDefault = true;
        
        if (sanitizedAddr.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(sanitizedAddr);
        // This save() call triggers the UserSchema.pre('save') hook
        await user.save();
        
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        // Return to prevent further execution if error occurs
        return res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Could not delete address.' });
    }
};