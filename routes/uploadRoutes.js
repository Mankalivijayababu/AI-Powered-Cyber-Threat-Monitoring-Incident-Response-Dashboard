const express = require("express");
const multer = require("multer");
const fs = require("fs");
const Log = require("../models/Log");
const detectThreats = require("../utils/detectThreats");

const router = express.Router();

// =======================================
// FILE UPLOAD CONFIG
// =======================================
const upload = multer({ dest: "uploads/" });

// =======================================
// CSV UPLOAD ROUTE
// =======================================
router.post("/csv", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      success: true,
      message: "File accepted, processing in background"
    });

    console.log("📂 Processing CSV:", req.file.originalname);

    const content = fs.readFileSync(req.file.path, "utf8");

    const lines = content
      .split("\n")
      .map(l => l.trim())
      .filter(l => l !== "");

    if (lines.length <= 1) {
      console.log("⚠️ CSV empty");
      fs.unlinkSync(req.file.path);
      return;
    }

    // Support comma OR tab CSV
    const delimiter = lines[0].includes("\t") ? "\t" : ",";

    const headers = lines[0]
      .toLowerCase()
      .split(delimiter)
      .map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {

      const values = lines[i].split(delimiter);

      const log = {};

      headers.forEach((h, idx) => {
        log[h] = values[idx]?.trim();
      });

      const ip = log.ip;
      const event = log.event;
      const timestamp = log.timestamp;

      if (!ip || !event || !timestamp) {
        console.log("⚠️ Skipping invalid row:", log);
        continue;
      }

      const date = new Date(timestamp);

      if (isNaN(date)) {
        console.log("⚠️ Invalid timestamp:", timestamp);
        continue;
      }

      // Normalize severity
      let severity = "Low";

      if (log.severity) {
        severity =
          log.severity.charAt(0).toUpperCase() +
          log.severity.slice(1).toLowerCase();
      }

      try {

        // Save Log
        const savedLog = await Log.create({
          timestamp: date,
          ip,
          event,
          user: log.user || "unknown",
          severity
        });

        console.log("📝 Log saved:", savedLog._id);

        // Run Threat Detection
        await detectThreats(savedLog, req);

      } catch (err) {

        console.log("⚠️ Log skipped:", err.message);

      }

    }

    fs.unlinkSync(req.file.path);

    console.log("✅ CSV processing completed");

  } catch (err) {

    console.error("❌ Upload processing error:", err);

  }

});

module.exports = router;