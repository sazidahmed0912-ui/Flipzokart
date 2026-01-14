
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Seed Admin User Function
const seedAdmin = async () => {
  try {
    const adminEmail = 'flipzokartshop@gmail.com';
    const adminPassword = 'Shahid@1999';
    
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      console.log('🚀 Seeding initial admin account...');
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword,
        role: 'admin'
      });
      console.log('✅ Admin account created successfully');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  }
};

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flipzokart';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await seedAdmin(); // Run the seed function
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Database connection error:', err));
