const nodemailer = require('nodemailer');

async function sendEmail(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Hoặc SMTP khác
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng (App password)
      }
    });

    await transporter.sendMail({
      from: `"Telehealth System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log(` Email sent to ${to}`);
  } catch (error) {
    console.error("XXX Email sending error:", error);
    throw new Error("Không thể gửi email");
  }
}

module.exports = sendEmail;
