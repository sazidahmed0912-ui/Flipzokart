const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Product = require('./models/Product');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flipzokart', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_log.txt', typeof msg === 'object' ? JSON.stringify(msg, null, 2) + '\n' : msg + '\n');
};

const inspectColors = async () => {
    await connectDB();
    fs.writeFileSync('debug_log.txt', ''); // Clear file

    try {
        // Fetch the most recently updated product
        const product = await Product.findOne().sort({ updatedAt: -1 });

        if (!product) {
            log("No products found.");
            process.exit();
        }

        log("=== LATEST PRODUCT ===");
        log(`Name: ${product.name}`);
        log(`ID: ${product._id}`);
        log(`Updated At: ${product.updatedAt}`);

        log("\n=== VARIANTS (Raw) ===");
        if (product.variants && product.variants.length > 0) {
            product.variants.forEach((v, i) => {
                log(`Variant ${i}:`);
                log(`  Color: '${v.color}' (Type: ${typeof v.color})`);
                log(`  Size: '${v.size}'`);
                log(`  Stock: ${v.stock}`);
            });
        }

        log("\n=== INVENTORY (Raw) ===");
        if (product.inventory && product.inventory.length > 0) {
            log(product.inventory);
        }

    } catch (error) {
        log(error);
    } finally {
        mongoose.connection.close();
    }
};

inspectColors();
