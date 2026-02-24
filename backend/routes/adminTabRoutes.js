const express = require('express');
const router = express.Router();
const {
    getAllTabs,
    createTab,
    updateTab,
    deleteTab,
    getCategoriesByTab,
    createCategory,
    deleteCategory
} = require('../controllers/dynamicTabController');
const {
    getAllTypes,
    createType,
    updateType,
    deleteType
} = require('../controllers/typeController');
const { protect, authorize } = require('../middlewares/auth');

// All dynamic tab management routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.route('/tabs')
    .get(getAllTabs)
    .post(createTab);

router.route('/tabs/:id')
    .put(updateTab)
    .delete(deleteTab);

router.route('/tabs/:tabId/categories')
    .get(getCategoriesByTab)
    .post(createCategory);

router.route('/tabs/categories/:id')
    .delete(deleteCategory);

// Type Management
router.route('/types')
    .get(getAllTypes)
    .post(createType);

router.route('/types/:id')
    .put(updateType)
    .delete(deleteType);

module.exports = router;
