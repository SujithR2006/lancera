const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server only on success
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
})
.then(() => {
    console.log('✅ MongoDB connected to lancera database');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// Basic root route
app.get('/', (req, res) => {
    res.send('Lancera API is running...');
});

