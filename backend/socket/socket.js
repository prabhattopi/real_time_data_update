import jwt from 'jsonwebtoken';
import Location from '../models/Location.js';

export const initSocket = (io) => {
  const activeUsers = new Map();

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Invalid token'));
        socket.userId = decoded.userId;
        next();
      });
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    activeUsers.set(socket.userId, {
      userId: socket.userId,
      lastActive: new Date()
    });

    socket.on('locationUpdate', async (locationData) => {
      try {
        const newLocation = await Location.create({
          location: {
            type: 'Point',
            coordinates: [locationData.lng, locationData.lat]
          },
          userId: socket.userId
        });
        
        io.emit('locationUpdate', newLocation);
        activeUsers.set(socket.userId, { 
          ...activeUsers.get(socket.userId),
          lastActive: new Date()
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('disconnect', () => {
      activeUsers.delete(socket.userId);
      io.emit('activeUsers', Array.from(activeUsers.values()));
    });

    setInterval(() => {
      const now = new Date();
      activeUsers.forEach((user, userId) => {
        if (now - user.lastActive > 30000) {
          activeUsers.delete(userId);
        }
      });
      io.emit('activeUsers', Array.from(activeUsers.values()));
    }, 5000);
  });
};