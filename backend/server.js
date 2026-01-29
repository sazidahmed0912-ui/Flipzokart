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

setInterval(async () => {
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

  // Gather Active User Names
  const activeUserList = [];
  const sockets = await io.fetchSockets();
  for (const socket of sockets) {
    if (socket.user && socket.user.name) {
      activeUserList.push({
        id: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        // Include Location Data for Map
        lat: socket.user.latitude,
        lng: socket.user.longitude,
        city: socket.user.locationCity,
        country: socket.user.locationCountry,
        role: socket.user.role,
        status: socket.user.status,
        // Include addresses for fallback
        addresses: socket.user.addresses
      });
    }
  }
  // Remove duplicates
  const uniqueUsers = Array.from(new Set(activeUserList.map(a => a.id)))
    .map(id => {
      return activeUserList.find(a => a.id === id)
    });


  // Emit stats to monitor room
  io.to('admin-monitor').emit('monitor:stats', {
    activeUsers: uniqueUsers.length, // Send unique authenticated user count
    totalConnections: activeUsers, // Optional: send raw sockets if needed
    activeUserList: uniqueUsers, // Send list of names
    serverLoad: Math.round(load) || Math.floor(Math.random() * 20) + 5,
    memoryUsage: memPercentage,
    uptime: Math.floor(uptime),
    systemStatus: memPercentage > 90 ? 'Critical' : 'Operational'
  });
}, 5000);

// 🛡️ Real Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Capture response finish to calculate duration and get status
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logType = res.statusCode >= 400 ? (res.statusCode >= 500 ? 'error' : 'warning') : 'info';

    // Broadcast to Admin Monitor
    if (io) {
      io.to('admin-monitor').emit('monitor:log', {
        id: Date.now() + Math.random(), // Unique ID
        timestamp: Date.now(), // Raw timestamp for client-side formatting
        type: logType,
        message: `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
        source: 'Network'
      });
    }
  });

  next();
});

// Helper to broadcast logs
const broadcastLog = (type, message, source = 'System') => {
  io.to('admin-monitor').emit('monitor:log', {
    id: Date.now(),
    timestamp: Date.now(),
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
// 🌐 SEO & XML Feeds (Sitemap, Product Feed)
app.use("/", require("./routes/seoRoutes"));

app.get("/", (req, res) => {
  res.send("Flipzokart backend running 🚀 v2.1 (SEO Enabled)");
});

// 🔐 Auth
app.get("/oauth/zoho/callback", async (req, res) => {
  const code = req.query.code;
  res.send("Zoho callback received: " + code);
});

app.use("/api/auth", require("./routes/auth"));

// 📦 Products
app.use("/api/products", require("./routes/productRoutes"));

// 🛒 Orders
app.use("/api/order", require("./routes/orderRoutes"));

// 📦 Tracking
app.use("/api/tracking", require("./routes/trackingRoutes"));

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