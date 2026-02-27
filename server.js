const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// ======================
// ROUTES IMPORT
// ======================
const userRoutes = require("./routes/userRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const authRoutes = require("./routes/authRoutes");
const logRoutes = require("./routes/logRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// ======================
// MIDDLEWARE IMPORT
// ======================
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// ======================
// INIT APP
// ======================
const app = express();
const server = http.createServer(app);

// ======================
// GLOBAL MIDDLEWARE
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-powered-cyber-threat-monitoring.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

// ======================
// SOCKET.IO CONFIG
// ======================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://ai-powered-cyber-threat-monitoring.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// make io available inside routes
app.set("io", io);

// ======================
// SOCKET CONNECTION
// ======================
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ======================
// ROUTES
// ======================

// PUBLIC ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);

// PROTECTED ROUTES
app.use("/api/logs", verifyFirebaseToken, logRoutes);
app.use("/api/dashboard", verifyFirebaseToken, dashboardRoutes);
app.use("/api/analytics", verifyFirebaseToken, analyticsRoutes);
app.use("/api/users", verifyFirebaseToken, userRoutes);

// UPLOAD ROUTE
app.use("/api/upload", uploadRoutes);

// INCIDENT ROUTES
app.use("/api/incidents", incidentRoutes);

// ======================
// ROOT ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("🚀 AI Cyber Threat Monitoring API Running");
});

// ======================
// DATABASE CONNECTION
// ======================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });