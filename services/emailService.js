const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAlertEmail(alert) {
  try {
    const mailOptions = {
      from: `"SOC Dashboard" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `🚨 HIGH Severity Alert: ${alert.type}`,
      html: `
        <h2 style="color:red;">⚠️ HIGH SEVERITY SECURITY ALERT</h2>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>IP Address:</strong> ${alert.ip || "N/A"}</p>
        <p><strong>User:</strong> ${alert.user || "N/A"}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <p>This alert was generated automatically by AI Threat Engine.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("📧 Alert email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

module.exports = sendAlertEmail;