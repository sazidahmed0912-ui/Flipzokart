const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/protect'); // Ensure protect middleware path is correct
const { getCart, updateCart } = require('../controllers/cartController');

router.route('/')
    .get(protect, getCart)
    .put(protect, updateCart);

module.exports = router;
