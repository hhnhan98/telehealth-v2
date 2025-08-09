require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// --- Kiểm tra biến môi trường quan trọng ---
if (!process.env.MONGODB_URI) {
  console.error('❌ Thiếu biến môi trường MONGODB_URI');
  process.exit(1);
}

// --- App setup ---
const app = express();
const server = http.createServer(app);

// --- Socket.IO Setup ---
const io = socketIO(server, {
  cors: {
    origin: '*', // Nên thay bằng domain frontend nếu có: 'http://localhost:3000'
    methods: ['GET', 'POST', 'PATCH']
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Kết nối MongoDB thành công'))
.catch((err) => {
  console.error('❌ Lỗi kết nối MongoDB:', err);
  process.exit(1);
});

// --- Import Routes ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const messageRoutes = require('./routes/message.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const healthRecordRoutes = require('./routes/healthRecord.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const doctorRoutes = require('./routes/doctor.routes');

// --- API Routes ---
app.use('/api/auth', authRoutes);                         // Đăng ký / Đăng nhập
app.use('/api/users', userRoutes);                        // Quản lý người dùng
app.use('/api/appointments', appointmentRoutes);          // Đặt / Hủy / Lịch hẹn
app.use('/api/medical-records', medicalRecordRoutes);     // Hồ sơ bệnh án
app.use('/api/messages', messageRoutes);                  // Tin nhắn chat
app.use('/api/specialties', specialtyRoutes);             // Chuyên khoa
app.use('/api/health-records', healthRecordRoutes);       // Hồ sơ sức khoẻ
app.use('/api/schedule', scheduleRoutes);                 // Khung giờ rảnh
app.use('/api/doctors', doctorRoutes);

// --- Error Handling ---
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// --- Socket.IO Logic ---
require('./socket')(io); // File socket.js chứa logic realtime, ví dụ: chat, gọi video...

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});