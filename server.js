// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinTicket', (ticketId) => {
        socket.join('ticket_' + ticketId);
        console.log(`User ${socket.id} joined ticket ${ticketId}`);
    });

    socket.on('sendMessage', (data) => {
        const { ticketId, userId, username, message, attachment } = data; // <-- add attachment
        const timestamp = new Date().toISOString();
    
        const msgData = { ticketId, userId, username, message, attachment, timestamp }; // <-- include it
    
        io.to('ticket_' + ticketId).emit('newMessage', msgData);
    });


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Socket.IO server is live!');
});

server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
