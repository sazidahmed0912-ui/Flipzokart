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
        const { imageUrl, mobileImageUrl, redirectUrl, title, subtitle, ctaText } = req.body;
        const count = await HomepageBanner.countDocuments();
        const banner = await HomepageBanner.create({
            imageUrl,
            mobileImageUrl,
            redirectUrl,
            title,
            subtitle,
            ctaText,
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
        banner.mobileImageUrl = req.body.mobileImageUrl !== undefined ? req.body.mobileImageUrl : banner.mobileImageUrl;
        banner.redirectUrl = req.body.redirectUrl !== undefined ? req.body.redirectUrl : banner.redirectUrl;

        banner.title = req.body.title !== undefined ? req.body.title : banner.title;
        banner.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : banner.subtitle;
        banner.ctaText = req.body.ctaText !== undefined ? req.body.ctaText : banner.ctaText;

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

// @desc    Admin: Seed default banners if empty
// @route   POST /api/admin/content/banners/seed
// @access  Private/Admin
const seedHomepageBanners = async (req, res) => {
    try {
        const count = await HomepageBanner.countDocuments();
        if (count > 0) {
            return res.status(400).json({ message: 'Banners already exist. Cannot seed.' });
        }

        const defaultBanners = [
            {
                title: "Start Selling for Everyone",
                subtitle: "Sell your products online and reach more customers with Fzokart",
                ctaText: "Join as a Seller",
                redirectUrl: "/sell",
                imageUrl: "/assets/banner_seller.png",
                mobileImageUrl: "/assets/banner_seller.png",
                position: 1
            },
            {
                title: "The Big Fashion Sale",
                subtitle: "Up to 50% OFF on Top Brands",
                ctaText: "Shop Now",
                redirectUrl: "/shop?tag=offer",
                imageUrl: "/assets/banner_offer_new.png",
                mobileImageUrl: "/assets/banner_offer_new.png",
                position: 2
            },
            {
                title: "Mega Savings Deal",
                subtitle: "Flat 50% OFF on Kids Collection & More",
                ctaText: "Shop Now",
                redirectUrl: "/shop?category=Kids",
                imageUrl: "/assets/banner_kids_new.jpg",
                mobileImageUrl: "/assets/banner_kids_new.jpg",
                position: 3
            }
        ];

        await HomepageBanner.insertMany(defaultBanners);
        res.status(201).json({ message: 'Default banners seeded successfully', banners: defaultBanners });
    } catch (error) {
        console.error(error);
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
        const { name, slug, bannerUrl, mobileBannerUrl, isActive } = req.body;

        // Check if exists
        let category = await Category.findOne({ slug });

        if (category) {
            // Update
            category.bannerUrl = bannerUrl || category.bannerUrl;
            category.mobileBannerUrl = mobileBannerUrl || category.mobileBannerUrl;
            category.isActive = isActive !== undefined ? isActive : category.isActive;
            await category.save();
        } else {
            // Create
            category = await Category.create({
                name,
                slug,
                bannerUrl,
                mobileBannerUrl
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

// @desc    Admin: Get Dashboard Stats
// @route   GET /api/admin/content/stats
// @access  Private/Admin
const getContentStats = async (req, res) => {
    try {
        const bannersCount = await HomepageBanner.countDocuments();
        const categoriesCount = await Category.countDocuments();
        const subcategoriesCount = await Subcategory.countDocuments();
        const activeBanners = await HomepageBanner.countDocuments({ isActive: true });

        res.json({
            banners: { total: bannersCount, active: activeBanners },
            categories: categoriesCount,
            subcategories: subcategoriesCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Reorder Banners
// @route   PUT /api/admin/content/banners/reorder
// @access  Private/Admin
const reorderBanners = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of banner IDs in new order
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const updates = orderedIds.map((id, index) => {
            return HomepageBanner.findByIdAndUpdate(id, { position: index + 1 });
        });

        await Promise.all(updates);
        res.json({ message: 'Banners reordered' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Admin: Get Unified Content (All Tables)
// @route   GET /api/admin/content/all
// @access  Private/Admin
const getUnifiedAdminContent = async (req, res) => {
    try {
        const [
            homepageBanners,
            homepageCategories, // These are the icons
            categories,
            subcategories
        ] = await Promise.all([
            HomepageBanner.find({}).sort({ position: 1 }),
            HomepageCategoryIcon.find({}).sort({ position: 1 }),
            Category.find({}).sort({ name: 1 }),
            Subcategory.find({}).sort({ categoryId: 1, position: 1 })
        ]);

        res.json({
            homepageBanners,
            homepageCategories,
            categories,
            subcategories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUnifiedAdminContent,
    getHomepageBanners,
    getAdminHomepageBanners,
    createHomepageBanner,
    updateHomepageBanner,
    deleteHomepageBanner,
    seedHomepageBanners,
    getContentStats,
    reorderBanners,

    getHomepageCategoryIcons,
    createHomepageCategoryIcon,
    updateHomepageCategoryIcon,
    deleteHomepageCategoryIcon,

    getCategoryContent,
    getAdminCategories,
    upsertCategory,
    upsertSubcategory,

    // Layout Management
    getCategoryLayout: async (req, res) => {
        try {
            const category = await Category.findOne({ slug: req.params.slug });
            if (!category) return res.status(404).json({ message: 'Category not found' });
            res.json({
                draft: category.draftLayout || [],
                published: category.pageLayout || []
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    saveCategoryLayout: async (req, res) => {
        try {
            const { layout } = req.body; // Array of sections
            const category = await Category.findOne({ slug: req.params.slug });
            if (!category) return res.status(404).json({ message: 'Category not found' });

            category.draftLayout = layout;
            await category.save();
            res.json({ message: 'Draft saved', layout: category.draftLayout });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    publishCategoryLayout: async (req, res) => {
        try {
            const category = await Category.findOne({ slug: req.params.slug });
            if (!category) return res.status(404).json({ message: 'Category not found' });

            category.pageLayout = category.draftLayout;
            await category.save();
            res.json({ message: 'Layout published', layout: category.pageLayout });
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};
