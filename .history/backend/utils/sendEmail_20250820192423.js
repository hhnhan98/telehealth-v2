// frontend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true nếu dùng 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Telehealth System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('Lỗi gửi email:', err);
    throw new Error('Không thể gửi email OTP');
  }
};

module.exports = sendEmail;
