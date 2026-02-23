const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
const Product = require('./models/Product');
const { validateAndCalculateDiscount } = require('./controllers/couponController');
require('dotenv').config();

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to DB for Tests');

        // Cleanup old test coupons
        await Coupon.deleteMany({ code: { $regex: /^TEST_/ } });

        // Create a Flat Discount Coupon
        const flatCoupon = new Coupon({
            code: 'TEST_FLAT500',
            type: 'FLAT',
            discountValue: 500,
            expiryDate: new Date(Date.now() + 86400000), // Active for 1 day
            minCartValue: 1000,
            status: 'ACTIVE'
        });
        await flatCoupon.save();

        // Create a Percent Discount Coupon
        const percentCoupon = new Coupon({
            code: 'TEST_OFF10',
            type: 'PERCENTAGE',
            discountValue: 10,
            expiryDate: new Date(Date.now() + 86400000),
            maxDiscount: 200, // Cap at 200
            status: 'ACTIVE'
        });
        await percentCoupon.save();

        // Mock Cart Context
        const mockCart = [
            { price: 1500, quantity: 1 } // Total 1500
        ];

        console.log('\n🧪 Testing Flat Discount (Min 1000, Cart 1500, Discount 500)');
        const mockUserId = new mongoose.Types.ObjectId().toString();
        const res1 = await validateAndCalculateDiscount(mockUserId, mockCart, 'TEST_FLAT500', 'COD');
        console.log(res1);
        if (res1.discountAmount === 500 && res1.finalCartTotal === 1000) {
            console.log('✅ Flat Discount Test Passed');
        } else {
            console.log('❌ Flat Discount Test Failed');
        }

        console.log('\n🧪 Testing Percentage Discount with Cap (10% of 1500 = 150 < 200)');
        const res2 = await validateAndCalculateDiscount(mockUserId, mockCart, 'TEST_OFF10', 'PREPAID');
        console.log(res2);
        if (res2.discountAmount === 150 && res2.finalCartTotal === 1350) {
            console.log('✅ Percent Discount Test Passed');
        } else {
            console.log('❌ Percent Discount Test Failed');
        }

    } catch (err) {
        console.error('❌ Test Execution Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ DB Disconnected');
    }
};

runTests();
