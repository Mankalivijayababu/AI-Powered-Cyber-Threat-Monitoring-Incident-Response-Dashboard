const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: String,
    message: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["open", "investigating", "contained", "resolved"],
      default: "open"
    },

    ip: String,
    user: String,

    // 🔥 NEW INCIDENT FIELDS
    assignedTo: {
      type: String, // analyst email or uid
      default: null
    },

    notes: [
      {
        text: String,
        addedBy: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],

    timeline: [
      {
        action: String,
        by: String,
        time: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);