const express = require("express");
const User = require("../models/User");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// ======================================
// GET ALL USERS (Admin only)
// ======================================
router.get("/users", verifyFirebaseToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ======================================
// UPDATE USER ROLE (Admin only)
// ======================================
router.put("/role/:uid", verifyFirebaseToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "analyst"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

// ======================================
// DELETE USER (Admin only)
// ======================================
router.delete("/:uid", verifyFirebaseToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ uid: req.params.uid });

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User removed successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;