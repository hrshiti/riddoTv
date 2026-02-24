const Tab = require('../models/Tab');
const Category = require('../models/Category');
const Type = require('../models/Type');
const Content = require('../models/Content');
const { hydrateContent } = require('../services/contentService');

// @desc    Get full dynamic structure (Tabs + Categories)
// @route   GET /api/public/dynamic-structure
const getDynamicStructure = async (req, res) => {
    try {
        const tabs = await Tab.find({ isActive: true }).sort({ order: 1 }).lean();
        const types = await Type.find({ isActive: true }).sort({ order: 1 }).lean();

        // For each tab, fetch its categories
        const tabStructure = await Promise.all(tabs.map(async (tab) => {
            const categories = await Category.find({ tabId: tab._id, isActive: true }).sort({ order: 1 }).lean();
            return {
                ...tab,
                categories,
                isDynamicType: false
            };
        }));

        // Map types to same structure (no categories for types)
        const typeStructure = types.map(t => ({
            ...t,
            categories: [],
            isDynamicType: true
        }));

        res.status(200).json({ success: true, data: [...tabStructure, ...typeStructure] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get content for a specific dynamic tab/category
// @route   GET /api/public/dynamic-content
const getDynamicContent = async (req, res) => {
    try {
        const { tabSlug, categorySlug } = req.query;

        let query = { status: 'published' };

        if (tabSlug) {
            const tab = await Tab.findOne({ slug: tabSlug });
            if (tab) {
                query.dynamicTabId = tab._id;
            } else {
                // Check if it's a dynamic type
                const type = await Type.findOne({ slug: tabSlug });
                if (type) {
                    query.type = type.slug;
                } else {
                    return res.status(200).json({ success: true, data: [] });
                }
            }
        }

        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (!category) return res.status(200).json({ success: true, data: [] });
            query.dynamicCategoryId = category._id;
        }

        const content = await Content.find(query).sort({ createdAt: -1 }).lean();
        const hydratedContent = content.map(item => hydrateContent(item));

        res.status(200).json({ success: true, data: hydratedContent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDynamicStructure,
    getDynamicContent
};
