const express = require('express');
const router = express.Router();
const {
    getHomepageBanners,
    getAdminHomepageBanners,
    createHomepageBanner,
    updateHomepageBanner,
    deleteHomepageBanner,
    seedHomepageBanners,
    reorderBanners,
    getUnifiedAdminContent,
    getContentStats,

    getHomepageCategoryIcons,
    createHomepageCategoryIcon,
    updateHomepageCategoryIcon,
    deleteHomepageCategoryIcon,

    getCategoryContent,
    getAdminCategories,
    upsertCategory,
    upsertSubcategory,
    upsertSubMenu, // NEW
    getFullCategoryTree, // NEW
    getCategoryLayout,
    saveCategoryLayout,
    publishCategoryLayout,
    exportContent,
    importContent
} = require('../controllers/contentController');

const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes (Frontend Fetch)
router.get('/banners', getHomepageBanners);
router.get('/home-categories', getHomepageCategoryIcons);
router.get('/categories/full-tree', getFullCategoryTree); // NEW: Dynamic Tree
router.get('/categories/:slug', getCategoryContent);

// Admin Routes (Management)
router.get('/admin/stats', protect, admin, getContentStats); // Dashboard Stats
router.post('/admin/banners/seed', protect, admin, seedHomepageBanners);
router.put('/admin/banners/reorder', protect, admin, reorderBanners); // Bulk Reorder

router.get('/admin/content/all', protect, admin, getUnifiedAdminContent);


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
router.post('/admin/submenu', protect, admin, upsertSubMenu); // NEW: Submenu Management

// Layout Builders
router.get('/admin/categories/:slug/layout', protect, admin, getCategoryLayout);
router.post('/admin/categories/:slug/layout', protect, admin, saveCategoryLayout);
router.post('/admin/categories/:slug/publish', protect, admin, publishCategoryLayout);

// Import/Export
router.get('/admin/export', protect, admin, exportContent);
router.post('/admin/import', protect, admin, importContent);

module.exports = router;
