const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminStation = require('../models/AdminStation');

// Protect routes - handles both users and responders
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('🔑 Token decoded:', decoded);
      
      // Check if it's a responder or regular user
      if (decoded.type === 'responder') {
        // Find station
        const station = await AdminStation.findById(decoded.id);
        
        if (!station) {
          return res.status(401).json({
            success: false,
            message: 'Station not found'
          });
        }
        
        req.user = {
          id: station._id,
          type: 'responder',
          stationType: station.stationType,
          stationName: station.stationName
        };
        
        console.log('✅ Responder authenticated:', station.stationName);
      } else {
        // Find regular user
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        console.log('✅ User authenticated:', req.user.email);
      }
      
      next();
    } catch (error) {
      console.error('❌ Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Protect admin routes (for responders only)
exports.adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'responder') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Responders only.'
        });
      }
      
      const station = await AdminStation.findById(decoded.id);
      
      if (!station) {
        return res.status(401).json({
          success: false,
          message: 'Station not found'
        });
      }
      
      req.admin = {
        id: station._id,
        type: 'responder',
        stationType: station.stationType,
        stationName: station.stationName
      };
      
      console.log('✅ Admin authenticated:', station.stationName);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};