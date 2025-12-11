require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:hacker2011@emergencymobileapp.842j7pm.mongodb.net/emergency-response?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await createStations();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createStations() {
  const AdminStation = require('../models/AdminStation');
  
  await AdminStation.deleteMany({});
  console.log('Cleared existing stations');
const stations = [
  {
    email: 'dulag.police@emergency.ph',      // ADD THIS
    username: 'dulag.police@emergency.ph',
    password: 'police123',
    stationName: 'Dulag Municipal Police Station',
    stationType: 'Police',
    contactNumber: '09171234567',
    location: {
      latitude: 10.9538874,
      longitude: 125.0339845
    },
    address: 'X23M+HH5, Dulag, Leyte'
  },
  {
    email: 'dulag.fire@emergency.ph',         // ADD THIS
    username: 'dulag.fire@emergency.ph',
    password: 'fire123',
    stationName: 'Dulag Fire Station',
    stationType: 'Fire',
    contactNumber: '09171234568',
    location: {
      latitude: 10.9539509,
      longitude: 125.0338558
    },
    address: 'X23M+HGQ, Dulag, North Leyte'
  },
  {
    email: 'dulag.medical@emergency.ph',      // ADD THIS
    username: 'dulag.medical@emergency.ph',
    password: 'medical123',
    stationName: 'The Rural Health Unit of Dulag',
    stationType: 'Medical',
    contactNumber: '09171234569',
    location: {
      latitude: 10.9535352,
      longitude: 125.0339231
    },
    address: 'X23M+9H3, Dulag, 6505 Leyte'
  }
];

  for (const stationData of stations) {
    const station = await AdminStation.create(stationData);
    console.log('Created:', station.stationName);
    console.log('  Username:', stationData.username);
    console.log('  Password:', stationData.password);
    console.log('  Contact:', stationData.contactNumber);
    console.log('');
  }

  console.log('All stations created successfully!');
  console.log('');
  console.log('Responder Login Credentials:');
  console.log('Police: dulag.police@emergency.ph / police123');
  console.log('Fire: dulag.fire@emergency.ph / fire123');
  console.log('Medical: dulag.medical@emergency.ph / medical123');
}