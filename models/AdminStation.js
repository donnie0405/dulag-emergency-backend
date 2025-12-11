const mongoose = require('mongoose');
<<<<<<< HEAD
const bcrypt = require('bcryptjs');

const adminStationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
=======

const adminStationSchema = new mongoose.Schema({
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  stationType: {
    type: String,
    required: true,
    enum: ['Police', 'Fire', 'Medical']
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: {
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
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date
  }
}, {
  timestamps: true
});

<<<<<<< HEAD
// Hash password before saving
adminStationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminStationSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

=======
>>>>>>> 4e239071b749af7f534b8b920c79553e33195f71
module.exports = mongoose.model('AdminStation', adminStationSchema);