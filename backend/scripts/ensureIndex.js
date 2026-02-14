const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Try loading env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flipzokart';

console.log('Connecting to MongoDB at:', MONGO_URI);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Create unique index on email
        console.log('Creating unique index on email...');
        const result = await collection.createIndex({ email: 1 }, { unique: true, background: false });
        console.log('✅ Index created:', result);

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
