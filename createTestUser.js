require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');


  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing test user
    const deleted = await User.deleteOne({ email: 'test@example.com' });
    console.log('🗑️ Deleted existing users:', deleted.deletedCount);
    
    // Create new user
    const testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '09123456789',
      isVerified: true
    });
    
    console.log('\n✅ Test user created successfully!');
    console.log('================================');
    console.log('ID:', testUser._id);
    console.log('Email:', testUser.email);
    console.log('Full Name:', testUser.fullName);
    console.log('Phone:', testUser.phoneNumber);
    console.log('Verified:', testUser.isVerified);
    console.log('Password hash:', testUser.password.substring(0, 30) + '...');
    console.log('================================');
    
    // Test password comparison
    console.log('\n🔐 Testing password...');
    const match = await testUser.comparePassword('password123');
    console.log('Password comparison:', match ? '✅ PASS' : '❌ FAIL');
    
    if (!match) {
      console.log('⚠️ WARNING: Password comparison failed!');
    }
    
    console.log('\n📱 Use these credentials in the app:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();