require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test login process exactly like the controller
    const email = 'admin@flipzokart.com';
    const password = 'admin123';

    console.log('\n🔍 Testing login process...');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);

    // Step 1: Find user
    const user = await User.findOne({ email }).select('+password');
    console.log('\n👤 User found:', user ? '✅ YES' : '❌ NO');
    
    if (user) {
      console.log('📊 User details:');
      console.log('  - Name:', user.name);
      console.log('  - Email:', user.email);
      console.log('  - Role:', user.role);
      console.log('  - Has password:', user.password ? '✅ YES' : '❌ NO');
      
      // Step 2: Compare password
      if (user.password) {
        console.log('\n🔐 Testing password comparison...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
        
        if (isMatch) {
          console.log('\n🎉 Login should succeed!');
        } else {
          console.log('\n❌ Login will fail - password mismatch');
        }
      } else {
        console.log('\n❌ User has no password hash');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

testLogin();
