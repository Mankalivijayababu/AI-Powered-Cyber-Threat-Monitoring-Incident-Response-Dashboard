const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

// 📜 GET LOGS WITH FILTERS + PAGINATION
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      ip,
      event,
      user,
      severity,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Filters
    if (ip) query.ip = ip;
    if (event) query.event = event;
    if (user) query.user = user;
    if (severity) query.severity = severity;

    // Date filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments(query);

    res.json({
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error("Logs fetch error:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
