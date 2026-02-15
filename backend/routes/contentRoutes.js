const express = require('express');
const router = express.Router();
const {
    getHomepageBanners,
    getAdminHomepageBanners,
    createHomepageBanner,
    updateHomepageBanner,
    deleteHomepageBanner,

    getHomepageCategoryIcons,
    createHomepageCategoryIcon, // This was missing in the controller export check
    updateHomepageCategoryIcon,
    deleteHomepageCategoryIcon,

    getCategoryContent,
    getAdminCategories,
    upsertCategory,
    upsertSubcategory
} = require('../controllers/contentController');

const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes (Frontend Fetch)
router.get('/banners', getHomepageBanners);
router.get('/home-categories', getHomepageCategoryIcons);
router.get('/categories/:slug', getCategoryContent);

// Admin Routes (Management)
router.get('/admin/banners', protect, admin, getAdminHomepageBanners);
router.post('/admin/banners', protect, admin, createHomepageBanner);
router.put('/admin/banners/:id', protect, admin, updateHomepageBanner);
router.delete('/admin/banners/:id', protect, admin, deleteHomepageBanner);

router.post('/admin/home-categories', protect, admin, createHomepageCategoryIcon);
router.put('/admin/home-categories/:id', protect, admin, updateHomepageCategoryIcon);
router.delete('/admin/home-categories/:id', protect, admin, deleteHomepageCategoryIcon);

router.get('/admin/categories', protect, admin, getAdminCategories);
router.post('/admin/categories', protect, admin, upsertCategory);
router.post('/admin/subcategories', protect, admin, upsertSubcategory);

module.exports = router;
