require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

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

// 🚀 Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});