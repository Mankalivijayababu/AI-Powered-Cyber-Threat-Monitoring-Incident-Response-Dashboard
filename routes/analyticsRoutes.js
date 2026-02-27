const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");


// ===============================
// 🌍 ATTACK MAP DATA
// ===============================
router.get("/map", async (req, res) => {
  try {

    const alerts = await Alert.find().limit(100);

    const mapData = alerts.map(alert => ({
      ip: alert.ip,
      type: alert.type,
      severity: alert.severity,
      lat: alert.location?.lat || 0,
      lon: alert.location?.lon || 0,
      country: alert.location?.country || "Unknown",
      city: alert.location?.city || "Unknown"
    }));

    res.json(mapData);

  } catch (err) {
    console.error("Map analytics error:", err);
    res.status(500).json({ error: "Map data failed" });
  }
});


// ===============================
// 📈 ATTACK TIMELINE
// ===============================
router.get("/timeline", async (req, res) => {
  try {

    const timeline = await Alert.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%H:%M", date: "$createdAt" }
          },
          attacks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(timeline);

  } catch (err) {
    console.error("Timeline analytics error:", err);
    res.status(500).json({ error: "Timeline failed" });
  }
});


// ===============================
// 🌐 TOP ATTACKING IPs
// ===============================
router.get("/ips", async (req, res) => {
  try {

    const ips = await Alert.aggregate([
      {
        $group: {
          _id: "$ip",
          attacks: { $sum: 1 }
        }
      },
      { $sort: { attacks: -1 } },
      { $limit: 10 }
    ]);

    res.json(ips);

  } catch (err) {
    console.error("IP analytics error:", err);
    res.status(500).json({ error: "IP analytics failed" });
  }
});

module.exports = router;