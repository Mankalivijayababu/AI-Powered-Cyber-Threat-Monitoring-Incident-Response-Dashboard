const admin = require("../config/firebaseAdmin");
const Log = require("../models/Log");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ Missing token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      await Log.create({
        event: "AUTH_FAILURE",
        ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
        user: "unknown",
        severity: "medium",
        timestamp: new Date()
      });

      return res.status(401).json({ message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 🔥 Attach full user info
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role || "viewer"; // default role

    next();

  } catch (error) {

    console.error("Token verification error:", error.message);

    await Log.create({
      event: "AUTH_FAILURE",
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
      user: "unknown",
      severity: "high",
      timestamp: new Date()
    });

    return res.status(401).json({ message: "Invalid token" });
  }
};