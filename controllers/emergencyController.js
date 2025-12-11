 
const EmergencyRequest = require('../models/EmergencyRequest');
const Admin = require('../models/Admin');

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


// Get all emergency requests
exports.getAllEmergencyRequests = async (req, res) => {
  try {
    const requests = await EmergencyRequest.find()
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error getting emergency requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Create emergency request
// @route   POST /api/emergency/request
// @access  Private (User)
exports.createEmergencyRequest = async (req, res) => {
   console.log('🚨 Emergency Request Received!');
  console.log('User ID:', req.user?.id);
  console.log('Accident Type:', req.body.accidentType);
  console.log('Location:', req.body.location);
  try {
    const { accidentType, location, additionalDetails } = req.body;
    const userId = req.user.id;

    // Create emergency request
    const emergencyRequest = await EmergencyRequest.create({
      userId,
      accidentType,
      location,
      additionalDetails
    });

    // Find nearest admin based on accident type
    let stationType;
    if (accidentType === 'Medical Emergency') stationType = 'Medical';
    else if (accidentType === 'Fire Emergency') stationType = 'Fire';
    else stationType = 'Police';

    const admins = await Admin.find({ stationType });
    
    let nearestAdmin = null;
    let minDistance = Infinity;

    admins.forEach(admin => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        admin.location.latitude,
        admin.location.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestAdmin = admin;
      }
    });

    // Emit socket event for real-time notification
    if (global.io) {
      global.io.emit('newEmergencyRequest', {
        requestId: emergencyRequest._id,
        accidentType,
        location,
        nearestStation: nearestAdmin ? nearestAdmin.stationName : 'None'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request created successfully',
      data: emergencyRequest,
      nearestResponder: nearestAdmin ? {
        stationName: nearestAdmin.stationName,
        contactNumber: nearestAdmin.contactNumber,
        distance: minDistance.toFixed(2) + ' km'
      } : {
        stationName: 'Dulag Emergency Services',
        contactNumber: 'N/A',
        distance: 'N/A'
      }
    });
  } catch (error) {
    console.error('Emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all emergency requests
// @route   GET /api/emergency/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const requests = await EmergencyRequest.find(query)
      .populate('userId', 'fullName phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update request status
// @route   PUT /api/emergency/requests/:id/status
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency request not found'
      });
    }

    request.status = status;
    
    if (status === 'Completed') {
      request.completedAt = new Date();
      const responseTime = (request.completedAt - request.createdAt) / (1000 * 60);
      request.responseTime = Math.round(responseTime);
    }

    await request.save();

    // Emit socket event
    if (global.io) {
      global.io.emit('requestStatusUpdated', {
        requestId: request._id,
        status: request.status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};