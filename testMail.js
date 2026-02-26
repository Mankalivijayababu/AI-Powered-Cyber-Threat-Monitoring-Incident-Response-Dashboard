require("dotenv").config();
const sendAlertEmail = require("./services/emailService");

sendAlertEmail({
  type: "Test Alert",
  message: "Manual email test",
  severity: "high",
  ip: "8.8.8.8",
  user: "testUser"
});