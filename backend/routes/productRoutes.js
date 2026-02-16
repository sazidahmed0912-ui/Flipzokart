const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ➕ ADD PRODUCT
// ➕ ADD PRODUCT
const createProduct = async (req, res) => {
  try {
    // 🛠️ DATA HYDRATION: Unpack Metadata from Description
    // The Admin Panel packs rich data (gallery, variants) into description.
    // We must unpack this to top-level fields for the Storefront to work.
    if (req.body.description && req.body.description.includes('<!-- METADATA:')) {
      try {
        const metaStr = req.body.description.split('<!-- METADATA:')[1].split('-->')[0];
        const meta = JSON.parse(metaStr);

        // Map Metadata to Schema Fields
        if (meta.gallery && Array.isArray(meta.gallery)) req.body.images = meta.gallery;

        // Transform Rich Variants (Admin format) to Simple Variants (DB Schema)
        if (meta.variants && Array.isArray(meta.variants)) {
          req.body.variants = meta.variants.map(v => ({
            name: v.name,
            options: v.options.map(o => (typeof o === 'object' && o.name) ? o.name : o)
          }));
        }

        if (meta.matrix) req.body.inventory = meta.matrix;
        if (meta.specifications) req.body.specifications = meta.specifications;
        if (meta.sku) req.body.sku = meta.sku;

        console.log("✅ [Product] Unpacked Metadata:", {
          images: req.body.images?.length,
          variants: req.body.variants?.length
        });
      } catch (e) {
        console.warn("⚠️ [Product] Failed to parse metadata:", e.message);
      }
    }

    console.log("👉 [POST /add] Payload:", JSON.stringify(req.body, null, 2));
    const product = new Product(req.body);
    const savedProduct = await product.save();

    // Socket Emit
    const io = req.app.get('socketio');
    if (io) io.emit('newProduct', savedProduct);

    // Return wrapped format to match AdminProducts.tsx: data.data.product
    res.status(201).json({ success: true, data: { product: savedProduct } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post("/add", createProduct);
router.post("/", createProduct); // Alias for frontend compatibility

// 📦 GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { category, subcategory, submenu, search, minPrice, maxPrice, sortBy } = req.query;

    // 🔒 FORCE VISIBILITY DEFAULTS
    let filter = {};

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Subcategory filter
    if (subcategory && subcategory !== 'All') {
      filter.subcategory = subcategory;
    }

    // Submenu filter
    if (submenu && submenu !== 'All') {
      filter.submenu = submenu;
    }

    // Search filter
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }


    let query = Product.find(filter);

    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-low':
          query = query.sort('price');
          break;
        case 'price-high':
          query = query.sort('-price');
          break;
        case 'newest':
          query = query.sort('-createdAt');
          break;
        default:
          query = query.sort('-createdAt');
      }
    } else {
      query = query.sort('-createdAt');
    }

    const products = await query;
    const hydratedProducts = products.map(p => {
      const pObj = p.toObject();

      // 1. Unpack Metadata
      if (pObj.description && pObj.description.includes('<!-- METADATA:')) {
        try {
          const metaStr = pObj.description.split('<!-- METADATA:')[1].split('-->')[0];
          const meta = JSON.parse(metaStr);
          if (meta.gallery && Array.isArray(meta.gallery) && (!pObj.images || pObj.images.length === 0)) {
            pObj.images = meta.gallery;
          }
          if (meta.variants && (!pObj.variants || pObj.variants.length === 0)) {
            // Transform Rich Variants to Simple Schema for consistency
            pObj.variants = meta.variants.map(v => ({
              name: v.name,
              options: v.options.map(o => (typeof o === 'object' && o.name) ? o.name : o)
            }));
          }
        } catch (e) { }
      }

      // 2. Legacy Fallback
      if ((!pObj.images || pObj.images.length === 0) && pObj.image) {
        pObj.images = [pObj.image];
      }

      // 3. 🛡️ MANDATORY FIX: Ensure mainImage is always present
      pObj.mainImage = pObj.mainImage || pObj.image || (pObj.images && pObj.images[0]) || '/placeholder.png';

      return pObj;
    });
    res.status(200).json(hydratedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🥬 GET GROCERY PRODUCTS (Enterprise Catalog)
router.get("/groceries", async (req, res) => {
  try {
    const { subcategory, search, inStock } = req.query;

    let filter = { category: 'Groceries' };

    // Subcategory filter (for future enhancement)
    if (subcategory && subcategory !== 'All') {
      // Assuming we'll add subcategory field later
      filter.subcategory = subcategory;
    }

    // Search filter
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Stock filter
    if (inStock === 'true') {
      filter.countInStock = { $gt: 0 };
    }

    const products = await Product.find(filter).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: products.length,
      category: 'Groceries',
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📊 GET MARKET CATALOG SUMMARY
router.get("/catalog/summary", async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$countInStock' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalProducts = await Product.countDocuments();
    const totalValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$countInStock'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      summary,
      totalProducts,
      totalInventoryValue: totalValue[0]?.totalValue || 0,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔄 GET RELATED PRODUCTS
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { exclude, limit = 8 } = req.query;

    const filter = {
      category: categoryId
    };

    if (exclude) {
      filter._id = { $ne: exclude };
    }

    const products = await Product.find(filter)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Hydrate products (ensure images/mainImage/variants are set)
    const hydratedProducts = products.map(p => {
      const pObj = p.toObject();
      // Basic hydration similar to GET /
      if ((!pObj.images || pObj.images.length === 0) && pObj.image) {
        pObj.images = [pObj.image];
      }
      pObj.mainImage = pObj.mainImage || pObj.image || (pObj.images && pObj.images[0]) || '/placeholder.png';
      return pObj;
    });

    res.status(200).json(hydratedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🛠️ DATA HYDRATION: Polyfill 'images' from 'image' AND Unpack Metadata
    // This allows the strict frontend array logic to work with old data on the fly
    const productObj = product.toObject();

    // 1. Unpack Metadata if it exists (for variants, specs, gallery)
    if (productObj.description && productObj.description.includes('<!-- METADATA:')) {
      try {
        const metaStr = productObj.description.split('<!-- METADATA:')[1].split('-->')[0];
        const meta = JSON.parse(metaStr);

        if (meta.gallery && Array.isArray(meta.gallery) && (!productObj.images || productObj.images.length === 0)) {
          productObj.images = meta.gallery;
        }
        if (meta.variants && (!productObj.variants || productObj.variants.length === 0)) {
          // Transform Rich Variants to Simple Schema
          productObj.variants = meta.variants.map(v => ({
            name: v.name,
            options: v.options.map(o => (typeof o === 'object' && o.name) ? o.name : o)
          }));
        }
        if (meta.matrix && (!productObj.inventory || productObj.inventory.length === 0)) {
          productObj.inventory = meta.matrix;
        }
        if (meta.specifications && !productObj.specifications) {
          productObj.specifications = meta.specifications;
        }
      } catch (e) {
        // Ignore parse errors on read
      }
    }

    // 2. Legacy Image Fallback (if still empty after unpack)
    if ((!productObj.images || productObj.images.length === 0) && productObj.image) {
      productObj.images = [productObj.image];
    }

    // 3. 🛡️ MANDATORY FIX: STRICT VARIANT SHAPE (User Requirement)
    // The 'variants' field MUST be the flat list (SKUs) derived strictly from 'inventory'.
    if (productObj.inventory && productObj.inventory.length > 0) {
      console.log(`[ProductDetail] Hydrating variants from inventory (count: ${productObj.inventory.length})`);
      productObj.variants = productObj.inventory.map(inv => {
        let color = "";
        let size = "";

        // Robust Options Parsing (Handle Map, Mongoose Map, or Plain Object)
        let opts = {};
        if (inv.options) {
          if (inv.options instanceof Map) {
            opts = Object.fromEntries(inv.options);
          } else if (typeof inv.options === 'object') {
            // If it's a Mongoose "Map" it might have .get(), but usually toObject() handles it.
            // We treat it as object.
            opts = inv.options;
          }
        }

        // Case-insensitive key search
        Object.keys(opts).forEach(key => {
          const k = key.trim().toLowerCase();
          const val = opts[key];
          if (k === 'color' || k === 'colour' || k.includes('color')) color = val;
          if (k === 'size') size = val;
        });

        return {
          id: inv.sku || inv._id?.toString() || Math.random().toString(36).substring(2, 9),
          color: color,
          size: size,
          image: inv.image,
          price: inv.price || productObj.price,
          stock: inv.stock,
          sku: inv.sku
        };
      });

      // Filter out invalid variants (Must have at least one attribute to be useful, but user said "variant without size -> FORBIDDEN")
      // We will be permissive but ensure they are not empty objects suitable for logic.
      // actually, let's keep all and let frontend filter if needed, but logging helps.
      console.log(`[ProductDetail] Generated ${productObj.variants.length} variants.`);

    } else {
      productObj.variants = [];
    }

    res.status(200).json(productObj);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: "Product not found (Invalid ID)" });
    }
    res.status(500).json({ message: error.message });
  }
});

// ✏️ UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    // 🛠️ DATA HYDRATION: Unpack Metadata logic for Updates
    if (req.body.description && req.body.description.includes('<!-- METADATA:')) {
      try {
        const metaStr = req.body.description.split('<!-- METADATA:')[1].split('-->')[0];
        const meta = JSON.parse(metaStr);

        if (meta.gallery && Array.isArray(meta.gallery)) req.body.images = meta.gallery;

        // Transform Rich Variants to Simple Schema
        if (meta.variants && Array.isArray(meta.variants)) {
          req.body.variants = meta.variants.map(v => ({
            name: v.name,
            options: v.options.map(o => (typeof o === 'object' && o.name) ? o.name : o)
          }));
        }

        if (meta.matrix) req.body.inventory = meta.matrix;
        if (meta.specifications) req.body.specifications = meta.specifications;
        if (meta.sku) req.body.sku = meta.sku;

      } catch (e) {
        console.warn("⚠️ [Product-Put] Failed to parse metadata:", e.message);
      }
    }

    console.log(`👉 [PUT /${req.params.id}] Payload:`, JSON.stringify(req.body, null, 2));
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Socket Emit
    const io = req.app.get('socketio');
    if (io) io.emit('productUpdated', product);

    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🗑️ DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Socket Emit
    const io = req.app.get('socketio');
    if (io) io.emit('deleteProduct', req.params.id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;