require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const HomepageBanner = require('../models/HomepageBanner');
const Category = require('../models/Category');

const connectDB = async () => {
    try {
        console.log("Connecting to DB...");
        const conn = await mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // TEST SEEDING (Simulate Controller Logic)
        if (process.argv.includes('--seed')) {
            console.log("\n--- ATTEMPTING SEED ---");
            const defaultBanners = [
                {
                    imageUrl: "/assets/banner_seller.png",
                    mobileImageUrl: "/assets/banner_seller.png",
                    redirectUrl: "/sell",
                    position: 1,
                    isActive: true
                }
            ];

            try {
                // Clear first to test clean seed
                // await HomepageBanner.deleteMany({}); 
                // console.log("Cleared Banners");

                const result = await HomepageBanner.create(defaultBanners);
                console.log("Seed Success! Created:", result.length, "banners");
            } catch (err) {
                console.error("Seed FAILED:", err.message);
            }
        }

        // 1. Check Banners
        const bannerCount = await HomepageBanner.countDocuments();
        console.log(`\n--- Banners ---`);
        console.log(`Count: ${bannerCount}`);

        // 2. Check Categories
        const categoryCount = await Category.countDocuments();
        console.log(`\n--- Categories ---`);
        console.log(`Count: ${categoryCount}`);

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

connectDB();
