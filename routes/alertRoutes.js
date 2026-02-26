const express = require("express");
const router = express.Router();
const axios = require("axios");
const Alert = require("../models/Alert");

// ============================
// CREATE ALERT WITH GEO LOCATION
// ============================
router.post("/", async (req, res) => {
  try {
    const { ip } = req.body;

    let geo = {};

    // 🌍 GET LOCATION FROM IP
    if (ip) {
      try {
        const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`);

        geo = {
          latitude: geoRes.data.latitude,
          longitude: geoRes.data.longitude,
          country: geoRes.data.country_name,
          city: geoRes.data.city
        };
      } catch (err) {
        console.log("Geo lookup failed:", err.message);
      }
    }

    // 💾 SAVE ALERT WITH GEO DATA
    const alert = await Alert.create({
      ...req.body,
      ...geo
    });

    // 🔥 EMIT LIVE ALERT
    const io = req.app.get("io");
    if (io) io.emit("new-alert", alert);

    res.status(201).json(alert);

  } catch (err) {
    console.error("Alert creation error:", err);
    res.status(500).json({ error: "Failed to create alert" });
  }
});

// ============================
// GET ALL ALERTS
// ============================
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

// ============================
// ALERT STATS
// ============================
router.get("/stats", async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const high = await Alert.countDocuments({ severity: "high" });
    const medium = await Alert.countDocuments({ severity: "medium" });
    const low = await Alert.countDocuments({ severity: "low" });

    res.json({ totalAlerts, high, medium, low });
  } catch (err) {
    res.status(500).json({ message: "Failed to load alert stats" });
  }
});

module.exports = router;