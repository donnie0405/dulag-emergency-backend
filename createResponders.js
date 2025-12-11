require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminStation = require('./models/AdminStation');

async function createResponders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing stations
    await AdminStation.deleteMany({});
    console.log('🗑️ Cleared existing stations');
    
    // Hash passwords
    const policePass = await bcrypt.hash('police123', 10);
    const firePass = await bcrypt.hash('fire123', 10);
    const healthPass = await bcrypt.hash('health123', 10);
    
    // Create responder accounts
    const responders = [
      {
        username: 'dulag.police@emergency.ph',
        password: policePass,
        stationName: 'Dulag Municipal Police Station',
        stationType: 'Police',
        contactNumber: '(053) 555-0100',
        address: 'X23M+HH5, Dulag, Leyte',
        location: {
          latitude: 10.9538874,
          longitude: 125.0339845
        }
      },
      {
        username: 'dulag.fire@emergency.ph',
        password: firePass,
        stationName: 'Dulag Fire Station, North Leyte',
        stationType: 'Fire',
        contactNumber: '(053) 555-0101',
        address: 'X23M+HGQ, Dulag, North Leyte',
        location: {
          latitude: 10.9539509,
          longitude: 125.0338558
        }
      },
      {
        username: 'dulag.health@emergency.ph',
        password: healthPass,
        stationName: 'The Rural Health Unit of Dulag, Leyte',
        stationType: 'Medical',
        contactNumber: '(053) 555-0102',
        address: 'X23M+9H3, Dulag, 6505 Leyte',
        location: {
          latitude: 10.9535352,
          longitude: 125.0339231
        }
      }
    ];
    
    await AdminStation.insertMany(responders);
    
    console.log('\n✅ Responder accounts created successfully!');
    console.log('========================================');
    console.log('🚓 POLICE:');
    console.log('   Email: dulag.police@emergency.ph');
    console.log('   Password: police123');
    console.log('');
    console.log('🚒 FIRE:');
    console.log('   Email: dulag.fire@emergency.ph');
    console.log('   Password: fire123');
    console.log('');
    console.log('🚑 HEALTH:');
    console.log('   Email: dulag.health@emergency.ph');
    console.log('   Password: health123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createResponders();