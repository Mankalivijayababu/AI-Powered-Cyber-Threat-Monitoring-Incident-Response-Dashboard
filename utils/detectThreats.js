const Alert = require("../models/Alert");
const Log = require("../models/Log");
const getIPLocation = require("./ipGeolocation");
const sendAlertEmail = require("../services/emailService");

/**
 * 🔐 AI Threat Detection Engine
 * Runs after each log insertion
 */
async function detectThreats(newLog, req) {
  try {
    console.log("🚀 detectThreats triggered");

    // ================================
    // Normalize values safely
    // ================================
    const ip = newLog?.ip?.toString().trim().toLowerCase();
    const user = newLog?.user?.toString().trim().toLowerCase() || "unknown";
    const event = newLog?.event?.toString().trim().toUpperCase();
    const timestamp = newLog?.timestamp || new Date();

    if (!ip || !event) {
      console.log("⚠️ Skipping log — missing ip or event");
      return;
    }

    console.log("📥 Processing:", event, "| IP:", ip);

    let alert = null;

    // =====================================================
    // 1️⃣ BRUTE FORCE ATTACK (5 latest failed attempts)
    // =====================================================
    if (event.includes("FAILED_LOGIN")) {

      const recentAttempts = await Log.find({
        ip,
        user,
        event: { $regex: "FAILED_LOGIN", $options: "i" }
      })
        .sort({ timestamp: -1 })
        .limit(5);

      console.log("🔎 Recent failed attempts:", recentAttempts.length);

      if (recentAttempts.length >= 5) {

        const existingAlert = await Alert.findOne({
          type: "Brute Force Attack",
          ip,
          status: { $ne: "resolved" }
        });

        if (existingAlert) {
          console.log("ℹ️ Existing open brute-force alert found. Skipping duplicate.");
        } else {

          let location = {};
          try {
            location = await getIPLocation(ip);
          } catch (e) {
            console.log("⚠️ Geo lookup failed:", e.message);
          }

          alert = await Alert.create({
            type: "Brute Force Attack",
            message: `Multiple failed login attempts for ${user} from ${ip}`,
            severity: "high",
            status: "open",
            ip,
            user,
            location,
            timeline: [{
              action: "Alert Created",
              by: "AI Engine",
              time: new Date()
            }]
          });

          console.log("🚨 Brute force alert created successfully");
        }
      }
    }

    // =====================================================
    // 2️⃣ MULTIPLE IP LOGIN
    // =====================================================
    if (event.includes("LOGIN_SUCCESS")) {

      const recentLogins = await Log.find({
        user,
        event: { $regex: "LOGIN_SUCCESS", $options: "i" }
      })
        .sort({ timestamp: -1 })
        .limit(5);

      const uniqueIps = new Set(recentLogins.map(l => l.ip));

      console.log("🌐 Unique login IPs:", uniqueIps.size);

      if (uniqueIps.size >= 3) {

        const existingAlert = await Alert.findOne({
          type: "Multiple IP Login",
          user,
          status: { $ne: "resolved" }
        });

        if (!existingAlert) {

          let location = {};
          try {
            location = await getIPLocation(ip);
          } catch {}

          alert = await Alert.create({
            type: "Multiple IP Login",
            message: `User ${user} logged in from multiple IP addresses`,
            severity: "medium",
            status: "open",
            user,
            ip,
            location,
            timeline: [{
              action: "Alert Created",
              by: "AI Engine",
              time: new Date()
            }]
          });

          console.log("🚨 Multiple IP login alert created");
        }
      }
    }

    // =====================================================
    // 3️⃣ UNUSUAL LOGIN TIME (12 AM – 4 AM)
    // =====================================================
    if (event.includes("LOGIN_SUCCESS")) {

      const hour = new Date(timestamp).getHours();

      if (hour >= 0 && hour <= 4) {

        const existingAlert = await Alert.findOne({
          type: "Unusual Login Time",
          user,
          status: { $ne: "resolved" }
        });

        if (!existingAlert) {

          let location = {};
          try {
            location = await getIPLocation(ip);
          } catch {}

          alert = await Alert.create({
            type: "Unusual Login Time",
            message: `Login detected at unusual hours for ${user}`,
            severity: "medium",
            status: "open",
            user,
            ip,
            location,
            timeline: [{
              action: "Alert Created",
              by: "AI Engine",
              time: new Date()
            }]
          });

          console.log("🚨 Unusual login time alert created");
        }
      }
    }

    // =====================================================
    // 🔔 NOTIFICATIONS (ONLY IF ALERT CREATED)
    // =====================================================
    if (alert) {

      console.log("🚨 Alert created — triggering notifications");

      // 🔌 Socket.io broadcast
      if (req?.app) {
        const io = req.app.get("io");
        if (io) {
          io.emit("new-alert", alert);
          console.log("⚡ Live alert emitted");
        }
      }

      // 📧 Email (high severity only)
      if (alert.severity === "high") {
        try {
          console.log("📧 Sending email...");
          await sendAlertEmail(alert);
          console.log("✅ Email sent successfully");
        } catch (emailError) {
          console.log("❌ Email error:", emailError.message);
        }
      }
    }

  } catch (error) {
    console.error("❌ Threat detection engine crashed:", error);
  }
}

module.exports = detectThreats;