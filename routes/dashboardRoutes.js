const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const Alert = require("../models/Alert");

// ===============================
// 📊 DASHBOARD STATS
// ===============================
router.get("/stats", async (req, res) => {

  try {

    // ===============================
    // TIME RANGE (LAST 24 HOURS)
    // ===============================
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // ===============================
    // PARALLEL DATABASE QUERIES
    // ===============================
    const [
      totalLogs,
      logs24h,
      activeAlerts,
      highSeverityAlerts,
      severityAgg
    ] = await Promise.all([

      Log.countDocuments(),

      Log.countDocuments({
        timestamp: { $gte: last24h }
      }),

      Alert.countDocuments({
        status: "open"
      }),

      Alert.countDocuments({
        severity: "high",
        status: "open"
      }),

      Log.aggregate([
        {
          $group: {
            _id: { $toLower: "$severity" },
            count: { $sum: 1 }
          }
        }
      ])

    ]);

    // ===============================
    // DEFAULT SEVERITY MAP
    // ===============================
    const severityMap = {
      low: 0,
      medium: 0,
      high: 0
    };

    // ===============================
    // FILL SEVERITY COUNTS
    // ===============================
    severityAgg.forEach(item => {

      if (severityMap[item._id] !== undefined) {
        severityMap[item._id] = item.count;
      }

    });

    // ===============================
    // FINAL RESPONSE
    // ===============================
    res.json({

      totalLogs,
      logs24h,
      activeAlerts,
      highSeverityAlerts,

      lowAlerts: severityMap.low,
      mediumAlerts: severityMap.medium,
      highAlerts: severityMap.high

    });

  } catch (err) {

    console.error("❌ Dashboard stats error:", err);

    res.status(500).json({
      error: "Failed to load dashboard stats"
    });

  }

});

module.exports = router;