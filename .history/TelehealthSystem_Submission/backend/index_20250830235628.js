require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// ===== Kiểm tra biến môi trường bắt buộc =====
if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// ===== Middleware bảo mật, log, giới hạn request =====
app.use(helmet());
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')
);
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 120,
    message: '*** Quá nhiều request, vui lòng thử lại sau.',
  })
);

// ===== CORS & Body parser =====
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// ===== Upload folder =====
app.use('/uploads', express.static('uploads'));

// ===== Kết nối MongoDB =====
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch((err) => {
    console.error('*** Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

// ===== Khai báo Routes =====
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/otp', require('./routes/otp.routes'));
app.use('/api/users', require('./routes/user.routes'));

app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/doctor', require('./routes/doctorDashboard.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));

app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/locations', require('./routes/location.routes'));
app.use('/api/specialties', require('./routes/specialty.routes'));
app.use('/api/medical-records', require('./routes/medicalRecord.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ===== Error handling middleware =====
app.use(notFound);
app.use(errorHandler);

// // ===== Socket.IO =====
// try {
//   const socketHandler = require('./socket');
//   if (typeof socketHandler === 'function') {
//     socketHandler(io);
//     console.log('>>> Socket.IO sẵn sàng');
//   }
// } catch {
//   console.warn('>>> Không tìm thấy file socket.js, bỏ qua Socket.IO');
// }

// ===== Mở server =====
const PORT = process.env.PORT || 5000;
const instance = server.listen(PORT, () => {
  console.log(`>>> Server chạy tại: http://localhost:${PORT}`);
});

// ===== Đóng server an toàn =====
const shutdown = () => {
  console.log('>>> Đang tắt server...');
  instance.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ===== Cron Jobs =====
try {
  require('./scripts/expireAppointments'); // cron job cho appointment hết hạn
  console.log('>>> Cron job expireAppointments đã được khởi động');
} catch (err) {
  console.error('*** Lỗi load cron job expireAppointments:', err.message);
}