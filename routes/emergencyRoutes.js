const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Create emergency request (requires user auth)
router.post('/request', protect, async (req, res) => {
  try {
    const { accidentType, location, additionalDetails } = req.body;
    const EmergencyRequest = require('../models/EmergencyRequest');

    console.log('Emergency request from:', req.user.fullName || req.user.stationName);

    const newRequest = await EmergencyRequest.create({
      userId: req.user.id,
      accidentType,
      location,
      additionalDetails,
      status: 'Pending'
    });

    const populatedRequest = await EmergencyRequest.findById(newRequest._id)
      .populate('userId', 'fullName email phoneNumber');

    // Broadcast new emergency via WebSocket
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Broadcasting new emergency...');
      io.emit('emergency-alert', {
        emergency: populatedRequest,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request created',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
});

// Get all emergency requests - NO AUTHENTICATION (for admin dashboard)
router.get('/requests', async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const requests = await EmergencyRequest.find()
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests for admin dashboard`);
    
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

// Get user's own requests (requires auth)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const requests = await EmergencyRequest.find({ userId: req.user.id })
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests for user`);
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// Update request status - NO AUTH (responders can update)
router.put('/requests/:id/status', async (req, res) => {
  try {
    const { status, responderId } = req.body;
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    console.log(`🔄 Updating emergency ${req.params.id} to status: ${status}`);
    
    const updateData = { status };
    if (responderId) {
      updateData.responderId = responderId;
    }
    
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'fullName email phoneNumber')
     .populate('responderId', 'stationName stationType');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
    console.log('✅ Request updated to:', status);
    
    // Broadcast status update via WebSocket
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Broadcasting status update...');
      
      io.to(req.params.id).emit('emergency-status', {
        emergencyId: req.params.id,
        status: status,
        timestamp: new Date()
      });
      
      io.emit('emergency-status', {
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

// Update responder location - NO AUTH
router.put('/requests/:id/location', async (req, res) => {
  try {
    const { location } = req.body;
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const request = await EmergencyRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
    request.responderLocation = location;
    await request.save();
    
    console.log('📍 Responder location updated');
    
    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// Complete emergency - NO AUTH
router.put('/requests/:id/complete', async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const request = await EmergencyRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
    console.log('✅ Completing emergency:', req.params.id);
    
    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();
    
    const populatedRequest = await EmergencyRequest.findById(request._id)
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType');
    
    // Broadcast via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('emergency-status', {
        emergencyId: req.params.id,
        status: 'Completed',
        timestamp: new Date()
      });
      
      io.emit('emergency-status', {
        emergencyId: req.params.id,
        status: 'Completed',
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      message: 'Emergency completed',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error completing emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete emergency',
      error: error.message
    });
  }
});

// Get single request - NO AUTH
router.get('/requests/:id', async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const request = await EmergencyRequest.findById(req.params.id)
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
});

module.exports = router;