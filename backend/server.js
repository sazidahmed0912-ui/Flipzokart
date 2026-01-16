require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.31.152:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Import the User model

const userSocketMap = new Map(); // userId -> socketId

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    if (!socket.user) {
      return next(new Error('Authentication error: User not found'));
    }
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.email);

  // Store user-socket mapping
  userSocketMap.set(socket.user.id, socket.id);

  // Join a room specific to the user
  socket.join(socket.user.id);

  // If the user is an admin, join the 'admin' room
  if (socket.user.role === 'admin') {
    socket.join('admin');
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.email);
    // Remove user from mapping
    userSocketMap.delete(socket.user.id);
  });
});

// Attach Socket.IO to the global object for easy access in controllers
app.set('socketio', io);

// 🔗 MongoDB connect
connectDB();

// 🔧 Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.31.152:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("E-commerce backend running 🚀");
});

// 🔐 AUTH ROUTES
app.use("/api/auth", require("./routes/auth"));

// 📦 PRODUCT ROUTES
app.use("/api/products", require("./routes/productRoutes"));

// 🛒 ORDER ROUTES
app.use("/api/order", require("./routes/orderRoutes"));

// 🔔 NOTIFICATION ROUTES
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 👑 ADMIN ROUTES
app.use("/api/admin", require("./routes/adminRoutes"));

// 🚀 Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});