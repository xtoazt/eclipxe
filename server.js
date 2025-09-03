const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store online users
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login
  socket.on('user-login', (username) => {
    onlineUsers.set(socket.id, username);
    console.log(`${username} logged in`);
    
    // Broadcast updated user count and list
    io.emit('users-update', {
      count: onlineUsers.size,
      users: Array.from(onlineUsers.values())
    });
  });

  // Handle user logout
  socket.on('user-logout', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      onlineUsers.delete(socket.id);
      console.log(`${username} logged out`);
      
      // Broadcast updated user count and list
      io.emit('users-update', {
        count: onlineUsers.size,
        users: Array.from(onlineUsers.values())
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      onlineUsers.delete(socket.id);
      console.log(`${username} disconnected`);
      
      // Broadcast updated user count and list
      io.emit('users-update', {
        count: onlineUsers.size,
        users: Array.from(onlineUsers.values())
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});