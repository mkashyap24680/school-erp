const { Notification, User } = require("../models");
const nodemailer = require("nodemailer");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // Email not configured — in-app notifications still work fine.
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Creates an in-app notification for a user, and — if SMTP is configured in
 * .env — also emails them. Never throws; notification failures should not
 * break the calling request.
 */
async function notifyUser(userId, { title, message, type = "general" }) {
  try {
    await Notification.create({ user_id: userId, title, message, type });

    const t = getTransporter();
    if (t) {
      const user = await User.findByPk(userId);
      if (user?.email) {
        await t.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: user.email,
          subject: title,
          text: message,
        }).catch((err) => console.error("Email send failed:", err.message));
      }
    }
  } catch (err) {
    console.error("notifyUser failed:", err.message);
  }
}

module.exports = { notifyUser };
