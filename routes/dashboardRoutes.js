const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const Alert = require("../models/Alert");

// 📊 Dashboard stats
router.get("/stats", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const totalLogs = await Log.countDocuments();

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs24h = await Log.countDocuments({
      timestamp: { $gte: last24h }
    });

    const activeAlerts = await Alert.countDocuments({
      status: "open"
    });

    const highSeverityAlerts = await Alert.countDocuments({
      severity: "high",
      status: "open"
    });

    // 🔥 Severity-based aggregation (AUTH failures)
    const severityAgg = await Log.aggregate([
      {
        $match: { type: "auth_failure" }
      },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    const severityMap = {
      low: 0,
      medium: 0,
      high: 0
    };

    severityAgg.forEach((item) => {
      severityMap[item._id] = item.count;
    });

    res.json({
      totalLogs,
      logs24h,
      activeAlerts,
      highSeverityAlerts,
      lowAlerts: severityMap.low,
      mediumAlerts: severityMap.medium
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

module.exports = router;
