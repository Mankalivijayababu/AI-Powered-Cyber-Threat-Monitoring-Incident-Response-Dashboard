const Log = require("../models/Log");
const Alert = require("../models/Alert");

const { classifyThreat } = require("../services/aiThreatEngine");
const { detectAnomaly } = require("../services/anomalyDetector");
const { blockIP } = require("../services/ipBlocker");
const { sendSecurityAlertEmail } = require("../services/emailService");

// ==============================
// 📥 INGEST NEW LOG
// ==============================
exports.ingestLog = async (req, res) => {
  try {
    const { ip, event, user, metadata } = req.body;

    // 🔒 Validate required
    if (!ip || !event) {
      return res.status(400).json({ message: "ip and event required" });
    }

    // ==============================
    // 💾 SAVE LOG
    // ==============================
    const newLog = await Log.create({
      ip,
      event,
      user: user || "unknown",
      metadata: metadata || {},
      timestamp: new Date()
    });

    // ==============================
    // 🤖 AI THREAT CLASSIFICATION
    // ==============================
    const aiResult = classifyThreat(newLog);

    // ==============================
    // 📊 ANOMALY DETECTION
    // ==============================
    const recentLogs = await Log.find({
      timestamp: {
        $gte: new Date(Date.now() - 5 * 60 * 1000)
      }
    });

    const anomaly = detectAnomaly(recentLogs, newLog);

    // ==============================
    // 🚨 CREATE ALERT (AI)
    // ==============================
    let createdAlert = null;

    if (aiResult.type !== "Suspicious Activity") {
      createdAlert = await Alert.create({
        type: aiResult.type,
        severity: aiResult.severity,
        message: aiResult.recommendation,
        ip: newLog.ip,
        user: newLog.user,
        status: "open",
        timeline: [
          {
            action: "Alert created by AI engine",
            by: "system"
          }
        ]
      });
    }

    if (createdAlert && 
   (createdAlert.severity === "high" || createdAlert.severity === "critical")) {

    // 🚫 Auto block
    await blockIP(createdAlert.ip, createdAlert.type);

    // 📧 Send email
    await sendSecurityAlertEmail(createdAlert);

    // 🧠 Add timeline entry
    createdAlert.timeline.push({
      action: "IP auto-blocked & email sent",
      by: "system"
    });

    await createdAlert.save();
}

    // ==============================
    // 🚨 CREATE ALERT (ANOMALY)
    // ==============================
    if (anomaly.anomaly) {
      createdAlert = await Alert.create({
        type: "Anomaly Detected",
        severity: "high",
        message: anomaly.reason,
        ip: newLog.ip,
        user: newLog.user,
        timeline: [
          {
            action: "Anomaly detected",
            by: "system"
          }
        ]
      });
    }

    // ==============================
    // 📡 REAL-TIME SOCKET EMIT
    // ==============================
    const io = req.app.get("io");

    if (io && createdAlert) {
      io.emit("new-alert", createdAlert);
    }

    res.status(201).json({
      message: "Log processed successfully",
      log: newLog,
      alert: createdAlert || null
    });

  } catch (err) {
    console.error("Log ingestion error:", err);
    res.status(500).json({ message: "Failed to process log" });
  }
};