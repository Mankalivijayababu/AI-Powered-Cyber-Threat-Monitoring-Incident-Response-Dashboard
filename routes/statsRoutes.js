const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const Alert = require("../models/Alert");

router.get("/", async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalLogs = await Log.countDocuments();
    const logs24h = await Log.countDocuments({
      timestamp: { $gte: last24h }
    });

    const activeAlerts = await Alert.countDocuments({
      status: "open"
    });

    const highSeverityAlerts = await Alert.countDocuments({
      status: "open",
      severity: "high"
    });

    res.json({
      totalLogs,
      logs24h,
      activeAlerts,
      highSeverityAlerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
