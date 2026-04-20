const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT) || 5000;

const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true },
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/live', require('./routes/live'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Teacher joins their own room to receive live updates
  socket.on('join_teacher_room', (teacherId) => {
    socket.join(`teacher_${teacherId}`);
    console.log(`Teacher ${teacherId} joined room`);
  });

  // Student joins a session room
  socket.on('join_session', ({ teacherId, sessionId }) => {
    socket.join(`session_${teacherId}_${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
    server.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.log('\nPlease check:');
    console.log('1. Your IP is whitelisted in MongoDB Atlas Network Access');
    console.log('2. Username and password are correct');
    console.log('3. Database name exists in your cluster');
    process.exit(1);
  });

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the other server process or change PORT in backend/.env.`);
    return;
  }

  console.error('Server startup error:', err);
});
