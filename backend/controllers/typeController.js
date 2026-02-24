const Type = require('../models/Type');

// @desc    Get all types (Admin)
// @route   GET /api/admin/types
const getAllTypes = async (req, res) => {
    try {
        const types = await Type.find().sort({ order: 1 });
        res.status(200).json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a type
// @route   POST /api/admin/types
const createType = async (req, res) => {
    try {
        const { name, slug, order, isSeries } = req.body;
        const type = await Type.create({ name, slug, order, isSeries });
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a type
// @route   PUT /api/admin/types/:id
const updateType = async (req, res) => {
    try {
        const type = await Type.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: type });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a type
// @route   DELETE /api/admin/types/:id
const deleteType = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);
        if (!type) return res.status(404).json({ success: false, message: 'Type not found' });

        await type.deleteOne();
        res.status(200).json({ success: true, message: 'Type deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllTypes,
    createType,
    updateType,
    deleteType
};
