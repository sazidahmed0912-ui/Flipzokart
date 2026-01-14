require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@flipzokart.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@flipzokart.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@flipzokart.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@flipzokart.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name:', admin.name);
    console.log('🆔 ID:', admin._id);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdmin();
