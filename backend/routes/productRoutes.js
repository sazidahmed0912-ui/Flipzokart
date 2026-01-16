const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ➕ ADD PRODUCT
router.post("/add", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📦 GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy } = req.query;
    
    let filter = {};
    
    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
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
    res.status(200).json(products);
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

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;