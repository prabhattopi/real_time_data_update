import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import locationRoutes from './routes/locations.js';
import clusterRoutes from './routes/clusters.js';
import authRoutes from './routes/auth.js';
import { initSocket } from './socket/socket.js';
import User from './models/User.js';

dotenv.config();

// Validate environment variables
['MONGO_URI', 'FRONTEND_URL', 'JWT_SECRET'].forEach(variable => {
  if (!process.env[variable]) throw new Error(`${variable} must be defined`);
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

// JWT Middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) req.user = decoded;
    });
  }
  next();
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const user = await User.findById(req.user.userId)
      .select('-password -__v');
      
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/clusters', clusterRoutes);



// Health check
app.get('/api/health', (req, res) => res.json({ 
  status: 'OK',
  timestamp: new Date()
}));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// WebSocket initialization
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});