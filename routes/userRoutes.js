const express = require("express");
const User = require("../models/User");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

const router = express.Router();

// create/update user after login
router.post("/sync", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req.user;

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email,
        role: "analyst" // default role
      });
    }

    res.json(user);
  } catch (err) {
    console.error("User sync error:", err);
    res.status(500).json({ message: "Failed to sync user" });
  }
});

module.exports = router;