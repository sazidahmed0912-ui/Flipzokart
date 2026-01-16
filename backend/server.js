require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

/* ===============================
   ✅ ALLOWED CLIENT URLS
   =============================== */
const CLIENT_URLS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.31.152:3000",
  "https://flipzokart.com",
  "https://www.flipzokart.com"
];

/* ===============================
   ✅ SOCKET.IO SETUP
   =============================== */
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: CLIENT_URLS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = new Map(); // userId -> socketId

// 🔐 Socket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.user.email);

  userSocketMap.set(socket.user.id, socket.id);
  socket.join(socket.user.id);

  if (socket.user.role === "admin") {
    socket.join("admin");
  }

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user.email);
    userSocketMap.delete(socket.user.id);
  });
});

// Make socket accessible in controllers
app.set("socketio", io);

/* ===============================
   ✅ DATABASE
   =============================== */
connectDB();

/* ===============================
   ✅ EXPRESS MIDDLEWARE
   =============================== */
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URLS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ===============================
   ✅ ROUTES
   =============================== */
app.get("/", (req, res) => {
  res.send("Flipzokart backend running 🚀");
});

// 🔐 Auth
app.use("/api/auth", require("./routes/auth"));

// 📦 Products
app.use("/api/products", require("./routes/productRoutes"));

// 🛒 Orders
app.use("/api/order", require("./routes/orderRoutes"));

// 🔔 Notifications
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 👑 Admin
app.use("/api/admin", require("./routes/adminRoutes"));

/* ===============================
   ✅ SERVER START
   =============================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});