const express = require('express');
const http = require('http'); // Required for Socket.IO
const socketio = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
const io = socketio(server, {
    cors: {
        origin: "*", // Allow all origins for React Native development
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing application/json bodies

// --- Database Connection ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};
connectDB();

// --- Route Imports ---
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes'); 
const productRoutes = require('./src/routes/productRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const orderRoutes = require('./src/routes/orderRoutes'); 
const { handleSocketConnection } = require('./src/controllers/messageController');
const nearbyRoutes = require('./src/routes/nearbyRoutes'); 
// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/nearby', nearbyRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('PetCare API is running.');
});

// --- Socket.IO Real-Time Messaging Handler ---
io.on('connection', (socket) => handleSocketConnection(socket, io));
// ----------------------------------------

const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));