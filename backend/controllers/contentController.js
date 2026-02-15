const HomepageBanner = require('../models/HomepageBanner');
const HomepageCategoryIcon = require('../models/HomepageCategoryIcon');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// --- Homepage Banners ---

// @desc    Get all homepage banners
// @route   GET /api/content/banners
// @access  Public
const getHomepageBanners = async (req, res) => {
    try {
        const banners = await HomepageBanner.find({ isActive: true }).sort({ position: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Get all banners (including inactive)
// @route   GET /api/admin/content/banners
// @access  Private/Admin
const getAdminHomepageBanners = async (req, res) => {
    try {
        const banners = await HomepageBanner.find({}).sort({ position: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Create banner
// @route   POST /api/admin/content/banners
// @access  Private/Admin
const createHomepageBanner = async (req, res) => {
    try {
        const { imageUrl, redirectUrl } = req.body;
        const count = await HomepageBanner.countDocuments();
        const banner = await HomepageBanner.create({
            imageUrl,
            redirectUrl,
            position: count + 1
        });
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Admin: Update banner
// @route   PUT /api/admin/content/banners/:id
// @access  Private/Admin
const updateHomepageBanner = async (req, res) => {
    try {
        const banner = await HomepageBanner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        banner.imageUrl = req.body.imageUrl || banner.imageUrl;
        banner.redirectUrl = req.body.redirectUrl !== undefined ? req.body.redirectUrl : banner.redirectUrl;
        banner.isActive = req.body.isActive !== undefined ? req.body.isActive : banner.isActive;
        banner.position = req.body.position || banner.position;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Admin: Delete banner
// @route   DELETE /api/admin/content/banners/:id
// @access  Private/Admin
const deleteHomepageBanner = async (req, res) => {
    try {
        const banner = await HomepageBanner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        await banner.deleteOne();
        res.json({ message: 'Banner removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Homepage Category Icons ---

// @desc    Get all homepage category icons
// @route   GET /api/content/home-categories
// @access  Public
const getHomepageCategoryIcons = async (req, res) => {
    try {
        const icons = await HomepageCategoryIcon.find({ isActive: true }).sort({ position: 1 });
        res.json(icons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Create category icon
// @route   POST /api/admin/content/home-categories
// @access  Private/Admin
const createHomepageCategoryIcon = async (req, res) => {
    try {
        const { categoryName, iconUrl, redirectUrl } = req.body;
        const count = await HomepageCategoryIcon.countDocuments();
        const icon = await HomepageCategoryIcon.create({
            categoryName,
            iconUrl,
            redirectUrl,
            position: count + 1
        });
        res.status(201).json(icon);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Admin: Update category icon
// @route   PUT /api/admin/content/home-categories/:id
// @access  Private/Admin
const updateHomepageCategoryIcon = async (req, res) => {
    try {
        const icon = await HomepageCategoryIcon.findById(req.params.id);
        if (!icon) return res.status(404).json({ message: 'Icon not found' });

        icon.categoryName = req.body.categoryName || icon.categoryName;
        icon.iconUrl = req.body.iconUrl || icon.iconUrl;
        // Allow empty string to clear optional redirect
        icon.redirectUrl = req.body.redirectUrl !== undefined ? req.body.redirectUrl : icon.redirectUrl;
        icon.isActive = req.body.isActive !== undefined ? req.body.isActive : icon.isActive;
        icon.position = req.body.position || icon.position;

        const updatedIcon = await icon.save();
        res.json(updatedIcon);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Admin: Delete category icon
// @route   DELETE /api/admin/content/home-categories/:id
// @access  Private/Admin
const deleteHomepageCategoryIcon = async (req, res) => {
    try {
        const icon = await HomepageCategoryIcon.findById(req.params.id);
        if (!icon) return res.status(404).json({ message: 'Icon not found' });

        await icon.deleteOne();
        res.json({ message: 'Icon removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Category & Subcategory Content ---

// @desc    Get Category Content (Banner + Subcats)
// @route   GET /api/content/categories/:slug
// @access  Public
const getCategoryContent = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            // Fallback: If category not found in DB, return empty/defaults so frontend doesn't crash
            // Or specific 404 if we want strictness. Let's return nulls.
            return res.json({ banner: null, subcategories: [] });
        }

        const subcategories = await Subcategory.find({ categoryId: category._id, isActive: true }).sort({ position: 1 });

        res.json({
            category,
            subcategories
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Get All Categories (for list)
// @route   GET /api/admin/content/categories
// @access  Private/Admin
const getAdminCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc   Admin: Create/Update Category Meta
// @route  POST /api/admin/content/categories
// @access Private/Admin
const upsertCategory = async (req, res) => {
    try {
        const { name, slug, bannerUrl, isActive } = req.body;

        // Check if exists
        let category = await Category.findOne({ slug });

        if (category) {
            // Update
            category.bannerUrl = bannerUrl || category.bannerUrl;
            category.isActive = isActive !== undefined ? isActive : category.isActive;
            // Name update if needed? Usually name/slug are tied.
            // category.name = name || category.name; 
            await category.save();
        } else {
            // Create
            category = await Category.create({
                name,
                slug,
                bannerUrl
            });
        }
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Admin: Add/Update Subcategory Icon
// @route   POST /api/admin/content/subcategories
// @access  Private/Admin
const upsertSubcategory = async (req, res) => {
    try {
        const { categoryId, name, slug, iconUrl, isActive, position } = req.body;

        let subcat = await Subcategory.findOne({ categoryId, slug });

        if (subcat) {
            subcat.iconUrl = iconUrl || subcat.iconUrl;
            subcat.isActive = isActive !== undefined ? isActive : subcat.isActive;
            subcat.position = position !== undefined ? position : subcat.position;
            await subcat.save();
        } else {
            subcat = await Subcategory.create({
                categoryId,
                name,
                slug,
                iconUrl,
                position: position || 0
            });
        }
        res.json(subcat);

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

module.exports = {
    getHomepageBanners,
    getAdminHomepageBanners,
    createHomepageBanner,
    updateHomepageBanner,
    deleteHomepageBanner,

    getHomepageCategoryIcons,
    createHomepageCategoryIcon,
    updateHomepageCategoryIcon,
    deleteHomepageCategoryIcon,

    getCategoryContent,
    getAdminCategories,
    upsertCategory,
    upsertSubcategory
};
