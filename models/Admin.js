const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  stationType: {
    type: String,
    required: true,
    enum: ['Police', 'Fire', 'Medical']
  },
  stationName: {
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
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'StationAdmin'],
    default: 'StationAdmin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);