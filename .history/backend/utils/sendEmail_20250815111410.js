// utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Hàm gửi email
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email dạng text
 */
const sendEmail = async (to, subject, text) => {
  try {
    // Tạo transporter với cấu hình SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // ví dụ: smtp.gmail.com
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true nếu dùng port 465
      auth: {
        user: process.env.EMAIL_USER, // email gửi
        pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng (App password)
      },
    });

    // Gửi email
    await transporter.sendMail({
      from: `"Telehealth System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email đã gửi tới ${to}`);
  } catch (error) {
    console.error('❌X Lỗi khi gửi email:', error);
    throw new Error('Gửi email thất bại');
  }
};

module.exports = sendEmail;
