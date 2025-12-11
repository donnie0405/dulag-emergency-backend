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

<<<<<<< HEAD
=======
    // Broadcast new emergency via WebSocket
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Broadcasting new emergency...');
      io.emit('emergency-alert', {
        emergency: populatedRequest,
        timestamp: new Date()
      });
    }

>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
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

<<<<<<< HEAD
// Get all emergency requests
router.get('/requests', protect, async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    let query = {};
    
    // If regular user, only show their requests
    if (req.user.type !== 'responder') {
      query.userId = req.user.id;
    }
    // Responders can see all requests
    
    const requests = await EmergencyRequest.find(query)
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests`);
=======
// Get all emergency requests - NO AUTHENTICATION (for admin dashboard)
router.get('/requests', async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const requests = await EmergencyRequest.find()
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests for admin dashboard`);
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
    
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

<<<<<<< HEAD
// Update request status
router.put('/requests/:id/status', protect, async (req, res) => {
=======
// Get user's own requests (requires auth)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const requests = await EmergencyRequest.find({ userId: req.user.id })
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${requests.length} requests for user ${req.user.fullName}`);
    
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
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
  try {
    const { status, responderId } = req.body;
    const EmergencyRequest = require('../models/EmergencyRequest');
    
<<<<<<< HEAD
    console.log('Status update from:', req.user.stationName || req.user.fullName);
=======
    console.log(`🔄 Updating emergency ${req.params.id} to status: ${status}`);
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
    
    const updateData = { status };
    if (responderId) {
      updateData.responderId = responderId;
    }
    
    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
<<<<<<< HEAD
    ).populate('userId', 'fullName email phoneNumber');
    
    console.log('✅ Request updated to:', status);
    
=======
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
      
      // Emit to specific emergency room
      io.to(req.params.id).emit('emergency-status', {
        emergencyId: req.params.id,
        status: status,
        timestamp: new Date()
      });
      
      // Also emit globally for admin dashboard
      io.emit('emergency-status', {
        emergencyId: req.params.id,
        status: status,
        timestamp: new Date()
      });
    }
    
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
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
<<<<<<< HEAD
// Complete emergency
router.put('/requests/:id/complete', protect, async (req, res) => {
  try {
=======

// Update responder location - NO AUTH (responders send location)
router.put('/requests/:id/location', async (req, res) => {
  try {
    const { location } = req.body;
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const request = await EmergencyRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }
    
<<<<<<< HEAD
    // Update to completed
    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();
    
    const populatedRequest = await EmergencyRequest.findById(request._id)
      .populate('userId', 'fullName email phoneNumber');
    
    console.log('✅ Emergency completed:', request._id);
    
    // Broadcast status update
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('emergency-status', {
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
=======
    request.responderLocation = location;
    await request.save();
    
    console.log('📍 Responder location updated for emergency:', req.params.id);
    
    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
      error: error.message
    });
  }
});
<<<<<<< HEAD
// Get single request
router.get('/requests/:id', protect, async (req, res) => {
  try {
    const EmergencyRequest = require('../models/EmergencyRequest');
    
    const request = await EmergencyRequest.findById(req.params.id)
      .populate('userId', 'fullName email phoneNumber');
    
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
// Complete emergency
router.put('/requests/:id/complete', protect, async (req, res) => {
=======

// Complete emergency - NO AUTH (responders can complete)
router.put('/requests/:id/complete', async (req, res) => {
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
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
    console.log('Previous status:', request.status);
    
    // Update to completed
    request.status = 'Completed';
    request.completedAt = new Date();
    await request.save();
    
    const populatedRequest = await EmergencyRequest.findById(request._id)
<<<<<<< HEAD
      .populate('userId', 'fullName email phoneNumber');
    
    console.log('✅ Emergency status updated to: Completed');
    
    // Broadcast status update via WebSocket - IMPORTANT!
=======
      .populate('userId', 'fullName email phoneNumber')
      .populate('responderId', 'stationName stationType');
    
    console.log('✅ Emergency status updated to: Completed');
    
    // Broadcast status update via WebSocket
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Broadcasting Completed status...');
      
      // Emit to specific emergency room
      io.to(req.params.id).emit('emergency-status', {
        emergencyId: req.params.id,
        status: 'Completed',
        timestamp: new Date()
      });
      
<<<<<<< HEAD
      // Also emit globally for admin dashboard and all clients
=======
      // Also emit globally for admin dashboard
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
      io.emit('emergency-status', {
        emergencyId: req.params.id,
        status: 'Completed',
        timestamp: new Date()
      });
      
      console.log('✅ WebSocket broadcast sent');
    } else {
      console.log('⚠️ Socket.io not available');
    }
    
    res.json({
      success: true,
      message: 'Emergency completed',
      data: populatedRequest
    });
  } catch (error) {
    console.error('❌ Error completing emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete emergency',
      error: error.message
    });
  }
});
<<<<<<< HEAD
=======

// Get single request - NO AUTH (anyone can view)
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

>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
module.exports = router;