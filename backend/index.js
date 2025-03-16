import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let activeUsers = 0;
let chartData = [];

const generateRandomData = () => ({
  value: Math.floor(Math.random() * 100),
  timestamp: new Date().toLocaleTimeString(),
});

setInterval(() => {
  if (chartData.length >= 10) chartData.shift();
  chartData.push(generateRandomData());
  io.emit('chartUpdate', chartData);
}, 2000);

io.on('connection', (socket) => {
    activeUsers++;
    
    // 🔥 Send current active users IMMEDIATELY to new user:
    socket.emit('activeUsers', activeUsers); 
  
    // 🔥 Broadcast updated count to all:
    io.emit('activeUsers', activeUsers);
  
    // Send chart data
    socket.emit('chartUpdate', chartData);
  
    // Handle disconnect
    socket.on('disconnect', () => {
      activeUsers--;
      io.emit('activeUsers', activeUsers);
    });
  });
  

server.listen(5000, () => console.log('Server running on port 8000'));
