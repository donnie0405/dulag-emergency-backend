const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, resendOTP } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    timestamp: new Date()
  });
});

// Unified login - checks both users and responders
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    const User = require('../models/User');
    const AdminStation = require('../models/AdminStation');
    
    // First, try to find as AdminStation (responder)
    const station = await AdminStation.findOne({ username: email });
    
    if (station) {
      console.log('✅ Found as responder:', station.stationName);
      
      // Verify password
      const isMatch = await bcrypt.compare(password, station.password);
      
      if (!isMatch) {
        console.log('❌ Invalid password');
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      
      console.log('✅ Password correct');
      
      // Generate token with responder type
      const token = jwt.sign(
        { 
          id: station._id,
          type: 'responder',
          stationType: station.stationType
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ Token generated for responder');
      
      return res.json({
        success: true,
        message: 'Login successful',
        userType: 'responder',
        token,
        station: {
          id: station._id,
          name: station.stationName,
          type: station.stationType,
          location: station.location,
          contact: station.contactNumber
        }
      });
    }
    
    // Not a responder, try as regular user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('✅ User found:', user.email);
    console.log('✅ User verified:', user.isVerified);
    
    // Check if verified
    if (!user.isVerified) {
      console.log('❌ User not verified');
      return res.status(401).json({
        success: false,
        message: 'Please verify your account first'
      });
    }
    
    // Compare password
    const isPasswordMatch = await user.comparePassword(password);
    console.log('✅ Password match:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token for regular user
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Token generated successfully');
    
    res.json({
      success: true,
      message: 'Login successful',
      userType: 'user',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Register route
router.post('/register', register);

// OTP verification
router.post('/verify-otp', verifyOTP);

// Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router;