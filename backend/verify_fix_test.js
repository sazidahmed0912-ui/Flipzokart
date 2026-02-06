const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

dotenv.config({ path: path.join(__dirname, '.env') });

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flipzokart');
        console.log("Connected to DB");

        // 1. Create a dummy product with the NEW flat variant structure
        const testId = new mongoose.Types.ObjectId();
        const testProduct = {
            _id: testId,
            name: "Test Color Save",
            price: 100,
            variants: [
                {
                    color: "TestBlue",
                    size: "M",
                    stock: 10,
                    price: 100
                }
            ]
        };

        // 2. Save it using Mongoose model (which uses the compiled Schema)
        // If Schema is correct, 'color' will be saved.
        // If Schema is wrong/old, 'color' will be stripped.
        const created = await Product.create(testProduct);
        console.log("Created Test Product");

        // 3. Fetch it back (lean to get POJO)
        const fetched = await Product.findById(testId).lean();

        console.log("=== FETCHED VARIANT [0] ===");
        if (fetched.variants && fetched.variants.length > 0) {
            console.log(fetched.variants[0]);

            if (fetched.variants[0].color === "TestBlue") {
                console.log("\n✅ SUCCESS: Color data was saved successfully!");
            } else {
                console.log("\n❌ FAILURE: Color data is MISSING. Schema issue likely persists.");
            }
        } else {
            console.log("❌ FAILURE: Variants array is empty.");
        }

        // Cleanup
        await Product.deleteOne({ _id: testId });
        console.log("Cleanup done.");

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};

verifyFix();
