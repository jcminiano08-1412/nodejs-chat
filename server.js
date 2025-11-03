// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust for security in production
        methods: ['GET', 'POST']
    }
});

const PORT = 3000;

// Store messages in memory (optional). In production, save to DB.
let messages = {}; // { ticketId: [ { userId, message, timestamp } ] }

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join ticket room
    socket.on('joinTicket', (ticketId) => {
        socket.join('ticket_' + ticketId);
        console.log(`User ${socket.id} joined ticket ${ticketId}`);

        // Send existing messages for this ticket
        if (messages[ticketId]) {
            messages[ticketId].forEach(msg => {
                socket.emit('newMessage', msg);
            });
        }
    });

    // Handle new message
    socket.on('sendMessage', (data) => {
        const { ticketId, userId, message } = data;
        const timestamp = new Date().toISOString();

        const msgData = { ticketId, userId, message, timestamp };

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

server.listen(PORT, () => {
    console.log(`Socket.IO server running at http://localhost:${PORT}`);
});
