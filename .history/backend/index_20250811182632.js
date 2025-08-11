require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Kiểm tra biến môi trường bắt buộc
if (!process.env.MONGODB_URI) {
  console.error('❌ Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  }
});

// Middleware bảo mật, log, giới hạn request
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Cấu hình CORS và parse body
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// Đăng ký route API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/medical-records', require('./routes/medicalRecord.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/specialties', require('./routes/specialty.routes'));
app.use('/api/health-records', require('./routes/healthRecord.routes'));
app.use('/api/schedule', require('./routes/schedule.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));

// Middleware xử lý lỗi
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// Socket.IO logic (chat, gọi video...)
try {
  const socketHandler = require('./socket');
  if (typeof socketHandler === 'function') {
    socketHandler(io);
    console.log('✅ Socket.IO sẵn sàng');
  }
} catch {
  console.warn('⚠ Không tìm thấy file socket.js, bỏ qua Socket.IO');
}

// Chạy server
const PORT = process.env.PORT || 5000;
const instance = server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

// Đóng server an toàn khi dừng
const shutdown = () => {
  console.log('🛑 Đang tắt server...');
  instance.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
