const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Manually parse .env to avoid dotenv issues
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
            const key = line.substring(0, firstEquals).trim();
            const value = line.substring(firstEquals + 1).trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

const cities = [
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Delhi", state: "Delhi" },
    { city: "Bangalore", state: "Karnataka" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Ahmedabad", state: "Gujarat" },
    { city: "Jaipur", state: "Rajasthan" },
    { city: "Lucknow", state: "Uttar Pradesh" },
    { city: "Chandigarh", state: "Chandigarh" },
    { city: "Bhopal", state: "Madhya Pradesh" },
    { city: "Guwahati", state: "Assam" },
    { city: "Goa", state: "Goa" },
    { city: "Patna", state: "Bihar" },
    { city: "Ranchi", state: "Jharkhand" },
    { city: "Thiruvananthapuram", state: "Kerala" },
    { city: "Dehradun", state: "Uttarakhand" }
];

const seedAddresses = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing from environment variables.");
            console.log("Current directory:", process.cwd());
            console.log("Looking for .env at:", path.resolve(__dirname, '../.env'));
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        const users = await User.find({ "addresses.0": { $exists: false } });
        console.log(`Found ${users.length} users without addresses.`);

        if (users.length === 0) {
            console.log("No users to update. Creating dummy users...");
            // Create dummy users if DB is empty
            const dummyUsers = [
                "Rahul Sharma", "Priya Patel", "Amit Singh", "Sneha Gupta",
                "Vikram Malhotra", "Anjali Das", "Rohit Verma", "Kavita Reddy"
            ];

            for (const name of dummyUsers) {
                const loc = cities[Math.floor(Math.random() * cities.length)];
                await User.create({
                    name,
                    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
                    password: 'password123',
                    addresses: [{
                        name,
                        street: "123 Main St",
                        city: loc.city,
                        state: loc.state,
                        zip: "100000",
                        country: "India",
                        type: "Home"
                    }]
                });
            }
            console.log(`Created ${dummyUsers.length} dummy users.`);
        } else {
            for (const user of users) {
                const loc = cities[Math.floor(Math.random() * cities.length)];
                user.addresses.push({
                    name: user.name,
                    street: "Random Street 123",
                    city: loc.city,
                    state: loc.state,
                    zip: "000000",
                    country: "India",
                    type: "Home"
                });
                await user.save();
            }
            console.log(`Updated ${users.length} users with random addresses.`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAddresses();
