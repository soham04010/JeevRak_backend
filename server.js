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
const { handleSocketConnection } = require('./src/controllers/messageController');

// --- Mount Routes ---
// Auth: /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);
// Users: /api/users/consultants, /api/users/:id (profile update)
app.use('/api/users', userRoutes); 
// Products: /api/products (Requires separate implementation)
app.use('/api/products', productRoutes);
// Messages: /api/messages/:recipientId (History)
app.use('/api/messages', messageRoutes); 

// Health check endpoint
app.get('/', (req, res) => {
    res.send('PetCare API is running.');
});

// --- Socket.IO Real-Time Messaging Handler ---
io.on('connection', (socket) => handleSocketConnection(socket, io));
// ----------------------------------------

const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen for Socket.IO
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));