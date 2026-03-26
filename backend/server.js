const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/surgery', require('./routes/surgery'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/models', require('./routes/models'));

const http = require('http');
const { Server } = require('socket.io');
const initVitalsSocket = require('./sockets/vitalsSocket');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // In production, match this to your frontend URL
        methods: ['GET', 'POST']
    }
});

// Initialize Vitals Socket
initVitalsSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Basic root route
app.get('/', (req, res) => {
    res.send('Lancera API is running...');
});
