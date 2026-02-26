const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
require("dotenv").config();

// ======================
// IMPORT MIDDLEWARE
// ======================
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// ======================
// IMPORT ROUTES
// ======================
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// ======================
// INIT APP
// ======================
const app = express();
const server = http.createServer(app);

// ======================
// GLOBAL MIDDLEWARE
// ======================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// ======================
// SOCKET.IO
// ======================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.set("io", io);

// ======================
// ROUTES (IMPORTANT ORDER)
// ======================

// PUBLIC ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);  // 🔥 PUBLIC NOW

// PROTECTED ROUTES
app.use("/api/logs", verifyFirebaseToken, logRoutes);
app.use("/api/dashboard", verifyFirebaseToken, dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", verifyFirebaseToken, analyticsRoutes);
app.use("/api/users", verifyFirebaseToken, userRoutes);
app.use("/api/incidents", incidentRoutes);

// ======================
// CONNECT DB & START
// ======================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });