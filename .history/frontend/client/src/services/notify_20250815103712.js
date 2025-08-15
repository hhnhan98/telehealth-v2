// services/notify.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_TOKEN
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"Telehealth" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

async function sendSMS(to, body) {
  if (!twilioClient) {
    console.log('[DEBUG] SMS:', to, body);
    return;
  }
  return twilioClient.messages.create({ to, from: process.env.TWILIO_FROM, body });
}

module.exports = { sendEmail, sendSMS };
