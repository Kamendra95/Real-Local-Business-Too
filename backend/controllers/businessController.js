const Business = require('../models/Business');

// @desc    Get business info
// @route   GET /api/business/:type
// @access  Public
const getBusiness = async (req, res) => {
    try {
        const { type } = req.params;
        const business = await Business.findOne({ type });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        res.json({
            success: true,
            data: business
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update business info (Admin)
// @route   PUT /api/business/:type
// @access  Private/Admin
const updateBusiness = async (req, res) => {
    try {
        const { type } = req.params;
        const business = await Business.findOneAndUpdate(
            { type },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );

        res.json({
            success: true,
            data: business
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBusiness,
    updateBusiness
};