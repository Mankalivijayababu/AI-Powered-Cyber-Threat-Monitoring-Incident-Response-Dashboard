const Alert = require("../models/Alert");
const Log = require("../models/Log");
const sendSecurityAlert = require("../services/emailService");

async function detectThreat(log) {
  try {
    // ===============================
    // 1️⃣ BRUTE FORCE DETECTION
    // ===============================
    if (log.event === "FAILED_LOGIN") {
      const failedAttempts = await Log.countDocuments({
        ip: log.ip,
        event: "FAILED_LOGIN",
        timestamp: {
          $gte: new Date(Date.now() - 10 * 60 * 1000) // last 10 mins
        }
      });

      if (failedAttempts >= 5) {
        await Alert.create({
          type: "Brute Force Attack",
          ip: log.ip,
          count: failedAttempts,
          severity: "high",
          message: `Multiple failed login attempts from IP ${log.ip}`
        });
      }
    }
    const alert = await Alert.create({
   type: "Brute Force Attack",
   ip: log.ip,
   severity: "high",
   message: `Multiple failed login attempts`
});

await sendSecurityAlert(alert);

    // ===============================
    // 2️⃣ ACCOUNT BREACH PATTERN
    // ===============================
    if (log.event === "LOGIN_SUCCESS") {
      const prevFails = await Log.countDocuments({
        user: log.user,
        event: "FAILED_LOGIN",
        timestamp: {
          $gte: new Date(Date.now() - 10 * 60 * 1000)
        }
      });

      if (prevFails >= 3) {
        await Alert.create({
          type: "Possible Account Breach",
          ip: log.ip,
          severity: "high",
          message: `User ${log.user} logged in after multiple failures`
        });
      }
    }

    // ===============================
    // 3️⃣ MULTIPLE IP LOGIN
    // ===============================
    const recentIPs = await Log.distinct("ip", {
      user: log.user,
      timestamp: {
        $gte: new Date(Date.now() - 15 * 60 * 1000)
      }
    });

    if (recentIPs.length >= 3) {
      await Alert.create({
        type: "Multiple IP Login",
        severity: "medium",
        message: `User ${log.user} logged in from multiple IPs`
      });
    }

    // ===============================
    // 4️⃣ PASSWORD CHANGE ALERT
    // ===============================
    if (log.event === "PASSWORD_CHANGE") {
      await Alert.create({
        type: "Credential Modified",
        severity: "medium",
        message: `Password changed for user ${log.user}`
      });
    }

  } catch (err) {
    console.error("Threat detection error:", err);
  }
}

module.exports = detectThreat;
