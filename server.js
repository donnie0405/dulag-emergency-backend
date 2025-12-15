require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Test route for root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Emergency Assistance API is running!',
    status: 'online',
    websocket: 'active',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emergency', require('./routes/emergencyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join room for specific emergency
  socket.on('join-emergency', (emergencyId) => {
    socket.join(emergencyId);
    console.log(`📍 Socket ${socket.id} joined emergency ${emergencyId}`);
  });
  
  // Responder location update
  socket.on('responder-location-update', (data) => {
    const { emergencyId, location, responderId } = data;
    console.log(`📍 Responder ${responderId} location update for emergency ${emergencyId}`);
    
    // Broadcast to all clients in this emergency room
    io.to(emergencyId).emit('responder-location', {
      emergencyId,
      location,
      responderId,
      timestamp: new Date()
    });
  });

  
  socket.on('responder-location-update', (data) => {
    console.log('📍 Responder location update received:', data);
    
    const { emergencyId, location } = data;
    
    // Broadcast to all clients (including admin dashboard)
    io.emit('responder-location', {
      emergencyId,
      location,
      responderId: data.responderId,
      timestamp: new Date()
    });
    
    console.log('✅ Location broadcasted to all clients');
  });
  
  // Handle status updates
  socket.on('status-update', (data) => {
    console.log('🔄 Status update received:', data);
    
    const { emergencyId, status } = data;
    
    io.emit('emergency-status', {
      emergencyId,
      status,
      timestamp: new Date()
    });
    
    console.log('✅ Status update broadcasted');
  });

  // User location update (optional)
  socket.on('user-location-update', (data) => {
    const { emergencyId, location, userId } = data;
    console.log(`📍 User ${userId} location update for emergency ${emergencyId}`);
    
    io.to(emergencyId).emit('user-location', {
      emergencyId,
      location,
      userId,
      timestamp: new Date()
    });
  });
  
  // Emergency status update
  socket.on('status-update', (data) => {
    const { emergencyId, status } = data;
    console.log(`🚨 Status update for emergency ${emergencyId}: ${status}`);
    
    io.to(emergencyId).emit('emergency-status', {
      emergencyId,
      status,
      timestamp: new Date()
    });
  });
  
  // New emergency notification
  socket.on('new-emergency', (data) => {
    console.log('🚨 New emergency broadcast:', data.emergencyType);
    
    // Broadcast to all responders
    io.emit('emergency-alert', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);

  console.log(`📍 Network: http://192.168.3.48:${PORT}`);

  console.log(`📍 Network: http://192.168.3.48:${PORT}`);

  console.log(`🔌 WebSocket: Active`);
});