const axios = require('axios');

// @desc    Get nearby pet services (Clinics, Shops)
// @route   GET /api/nearby
// @access  Private
exports.getNearbyPlaces = async (req, res) => {
    const { lat, lng } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!lat || !lng) {
        return res.status(400).json({ success: false, error: "Latitude and Longitude are required" });
    }

    try {
        // We search for two types: veterinary_care (Clinics) and pet_store (Shops)
        // radius is in meters (5000 = 5km)
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&types=veterinary_care|pet_store&key=${apiKey}`;

        const response = await axios.get(url);
        
        // Map Google data to our cleaner format
        const places = response.data.results.map(item => ({
            id: item.place_id,
            name: item.name,
            address: item.vicinity,
            rating: item.rating,
            location: item.geometry.location,
            isOpen: item.opening_hours ? item.opening_hours.open_now : null,
            type: item.types.includes('veterinary_care') ? 'Clinic' : 'Pet Shop'
        }));

        res.status(200).json({ success: true, count: places.length, data: places });
    } catch (error) {
        console.error("Google Places Error:", error.message);
        res.status(500).json({ success: false, error: "Failed to fetch nearby places" });
    }
};