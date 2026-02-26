const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  user: {
    type: String
  },
  severity: {
    type: String,
    default: "low"
  },
  source: {
    type: String,
    default: "system"
  }
}, { timestamps: true });

module.exports = mongoose.model("Log", logSchema);
