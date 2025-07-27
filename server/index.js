import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import vehicleRoutes from './routes/vehicles.js';
import taskRoutes from './routes/tasks.js';
import poiRoutes from './routes/pois.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
// app.use(morgan('combined')); // Commented out to reduce log noise
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-vehicle', (vehicleId) => {
    socket.join(`vehicle-${vehicleId}`);
    console.log(`Client ${socket.id} joined vehicle ${vehicleId}`);
  });

  socket.on('leave-vehicle', (vehicleId) => {
    socket.leave(`vehicle-${vehicleId}`);
    console.log(`Client ${socket.id} left vehicle ${vehicleId}`);
  });

  socket.on('send-message', (data) => {
    const { vehicleId, message, sender } = data;
    const timestamp = new Date().toISOString();
    
    console.log(`📨 Message received from ${sender} to vehicle ${vehicleId}: "${message}"`);
    
    // Broadcast message to all clients in the vehicle room
    const messageData = {
      id: Date.now(),
      message,
      sender,
      timestamp,
      vehicleId
    };
    
    io.to(`vehicle-${vehicleId}`).emit('new-message', messageData);
    console.log(`📡 Broadcasted message to vehicle-${vehicleId} room via Socket.IO`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// API Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/pois', poiRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, async () => {
  // Connect to MongoDB
  await connectDB();
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
});

export default app; 