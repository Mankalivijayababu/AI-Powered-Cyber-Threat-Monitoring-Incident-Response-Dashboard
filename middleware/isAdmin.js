const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization error" });
  }
};