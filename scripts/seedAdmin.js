const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

async function seed() {
  const hashed = await bcrypt.hash("admin123", 10);

  await User.deleteMany({ username: "admin" });

  await User.create({
    username: "admin",
    password: "hashed",
    role: "admin",
  });

  console.log("Admin user created");
  process.exit();
}

seed();
