const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accidentType: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  additionalDetails: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'En Route', 'Arrived', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminStation'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);