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
  "http://127.0.0.1:63790",
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

  // ✅ Admin Monitor Room
  socket.on('join_monitor', () => {
    // Optional: Check if admin
    // if (socket.user.role === 'admin') 
    socket.join('admin-monitor');
  });

  socket.on("disconnect", () => {
    // console.log("❌ Socket disconnected:", socket.user.email);
    userSocketMap.delete(socket.user.id);
  });
});

/* ===============================
   ✅ REAL-TIME MONITORING LOOP
   =============================== */
const os = require('os');

setInterval(() => {
  const activeUsers = io.engine.clientsCount;
  const uptime = process.uptime(); // Seconds

  // Memory Usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = Math.round((usedMem / totalMem) * 100);

  // CPU Load (Simple Approximation)
  const cpus = os.cpus();
  const load = cpus.length > 0 ? (cpus[0].times.user / (cpus[0].times.user + cpus[0].times.idle)) * 100 : 0;

  // Emit stats to monitor room
  io.to('admin-monitor').emit('monitor:stats', {
    activeUsers,
    serverLoad: Math.round(load) || Math.floor(Math.random() * 20) + 5,
    memoryUsage: memPercentage,
    uptime: Math.floor(uptime),
    systemStatus: memPercentage > 90 ? 'Critical' : 'Operational'
  });
}, 2000);

// 🛡️ Mock Security Events (For Demo Purposes)
setInterval(() => {
  const events = [
    { type: 'warning', message: 'Failed login attempt (IP: 45.23.12.98)', source: 'Auth' },
    { type: 'error', message: 'Database connection spike detected', source: 'Database' },
    { type: 'warning', message: 'Unauthorized API access blocked', source: 'Firewall' },
    { type: 'error', message: 'Payment gateway timeout', source: 'Payment' },
    { type: 'warning', message: 'High memory usage warning', source: 'System' }
  ];

  if (Math.random() < 0.3) { // 30% chance every 5s
    const event = events[Math.floor(Math.random() * events.length)];
    io.to('admin-monitor').emit('monitor:log', {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: event.type,
      message: event.message,
      source: event.source
    });
  }
}, 5000);

// Helper to broadcast logs
const broadcastLog = (type, message, source = 'System') => {
  io.to('admin-monitor').emit('monitor:log', {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    type,
    message,
    source
  });
};

// Make broadcastLog available globally if needed (via app)
app.set("broadcastLog", broadcastLog);

// Make socket accessible in controllers
app.set("socketio", io);

/* ===============================
   ✅ DATABASE
   =============================== */
connectDB();

/* ===============================
   ✅ EXPRESS MIDDLEWARE
   =============================== */
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://flipzokart.com",
    "https://www.flipzokart.com",
    "https://flipzokart-backend.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

/* ===============================
   ✅ ROUTES
   =============================== */
app.get("/", (req, res) => {
  res.send("Flipzokart backend running 🚀 v2.0 (Legacy Fixes Applied)");
});

// 🔐 Auth
app.use("/api/auth", require("./routes/auth"));

// 📦 Products
app.use("/api/products", require("./routes/productRoutes"));

// 🛒 Orders
app.use("/api/order", require("./routes/orderRoutes"));

// 🔔 Notifications
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 👤 User & Profile
app.use("/api/user", require("./routes/userRoutes"));

// 👑 Admin
app.use("/api/admin", require("./routes/adminRoutes"));

// ⭐ Reviews
app.use("/api/reviews", require("./routes/reviewRoutes"));

// 🛒 Persistent Cart
app.use("/api/cart", require("./routes/cartRoutes"));

// 🔗 Frontend compatibility - alias /admin to /api/admin
app.use("/admin", require("./routes/adminRoutes"));

/* ===============================
   ✅ SERVER START
   =============================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 Version: ${new Date().toISOString()} - Variants Support Enabled`);
});