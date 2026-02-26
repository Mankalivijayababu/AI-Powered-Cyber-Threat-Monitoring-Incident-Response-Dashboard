require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove existing admin
    await User.deleteMany({ username: "admin" });

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Admin RESET successful (admin / admin123)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Admin reset failed:", err);
    process.exit(1);
  }
}

resetAdmin();
