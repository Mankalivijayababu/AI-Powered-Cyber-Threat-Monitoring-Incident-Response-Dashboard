const mongoose = require("mongoose");

const blockedIPSchema = new mongoose.Schema({
  ip: String,
  reason: String,
  blockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BlockedIP", blockedIPSchema);