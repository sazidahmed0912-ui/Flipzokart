require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateToAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email: 'shahidafridi20a@gmail.com' });
    if (!user) {
      console.log('User not found!');
      return;
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User updated to admin successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🆔 ID:', user._id);
    console.log('🔐 Role:', user.role);

  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateToAdmin();
