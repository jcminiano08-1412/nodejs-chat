const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // Replace '*' with your frontend URL in production
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;

let messages = {}; // Temporary memory storage

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinTicket', (ticketId) => {
        socket.join('ticket_' + ticketId);
        console.log(`User ${socket.id} joined ticket ${ticketId}`);

        if (messages[ticketId]) {
            messages[ticketId].forEach(msg => socket.emit('newMessage', msg));
        }
    });

    socket.on('sendMessage', (data) => {
        const { ticketId, userId, message } = data;
        const timestamp = new Date().toISOString();
        const msgData = { ticketId, userId, message, timestamp };

        if (!messages[ticketId]) messages[ticketId] = [];
        messages[ticketId].push(msgData);

        io.to('ticket_' + ticketId).emit('newMessage', msgData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
