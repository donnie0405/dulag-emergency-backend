const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { login, createStation } = require('../controllers/adminController');

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin routes are working!' 
  });
});

// Admin/Responder login
router.post('/login', login);

// Create station
router.post('/stations/create', createStation);
=======
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

// PUBLIC endpoint for admin dashboard (no auth required)
router.get('/public/requests', async (req, res) => {
  try {
    console.log('📊 Public dashboard request');
    
    const EmergencyRequest = require('../models/EmergencyRequest');
    const requests = await EmergencyRequest.find({})
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Returning ${requests.length} emergencies to dashboard`);
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// Responder login (no auth required)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== RESPONDER LOGIN ===');
    console.log('Email:', email);
    
    const AdminStation = require('../models/AdminStation');
    
    const station = await AdminStation.findOne({ username: email });
    
    if (!station) {
      console.log('❌ Station not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ Station found:', station.stationName);
    
    const isMatch = await bcrypt.compare(password, station.password);
    
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ Password correct');
    
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
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      station: {
        id: station._id,
        name: station.stationName,
        type: station.stationType,
        location: station.location,
        contact: station.contactNumber
      }
    });
    
  } catch (error) {
    console.error('❌ Responder login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Test route (no auth)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin routes are working!',
    timestamp: new Date()
  });
});

// Get all admin stations (requires auth)
router.get('/stations', protect, async (req, res) => {
  try {
    const AdminStation = require('../models/AdminStation');
    const stations = await AdminStation.find({}).select('-password');
    
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stations',
      error: error.message
    });
  }
});

// Get all emergency requests (requires auth)
router.get('/requests', protect, async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    const requests = await EmergencyRequest.find({})
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests for admin`);
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// Update request status (requires auth)
router.put('/requests/:id/status', protect, async (req, res) => {
  try {
    const { status, responderId } = req.body;
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    console.log('Status update from:', req.user.stationName || req.user.fullName);
    
    const updateData = { status };
    if (responderId) {
      updateData.responderId = responderId;
    }
    
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'fullName email phoneNumber');
    
    console.log('✅ Status updated to:', status);
    
    // Broadcast status update via socket
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('emergency-status', {
        emergencyId: req.params.id,
        status: status,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71

module.exports = router;