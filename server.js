// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.IO with proper CORS
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000', // local frontend
            'http://localhost:5500', // Live Server port if used
            // 'https://your-frontend.com' // add your deployed frontend later
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Use Railway port
const PORT = process.env.PORT || 3000;

// In-memory messages (temporary)
let messages = {}; // { ticketId: [ { userId, username, message, timestamp } ] }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join ticket room
    socket.on('joinTicket', (ticketId) => {
        socket.join('ticket_' + ticketId);
        console.log(`User ${socket.id} joined ticket ${ticketId}`);

        // Send existing messages for this ticket
        if (messages[ticketId]) {
            messages[ticketId].forEach(msg => socket.emit('newMessage', msg));
        }
    });

    // Handle new message
    socket.on('sendMessage', (data) => {
        const { ticketId, userId, username, message } = data; // destructure username from client
        const timestamp = new Date().toISOString();

        const msgData = { ticketId, userId, username, message, timestamp };

        // Save to memory
        if (!messages[ticketId]) messages[ticketId] = [];
        messages[ticketId].push(msgData);

        // Broadcast to all users in the ticket room
        io.to('ticket_' + ticketId).emit('newMessage', msgData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Optional test route
app.get('/', (req, res) => {
    res.send('Socket.IO server is live!');
});

// Start server
server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
