require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// --- 🔌 Socket.IO Setup ---
const io = socketIO(server, {
  cors: {
    origin: '*', // Đổi thành domain FE nếu có: 'http://localhost:3000'
    methods: ['GET', 'POST', 'PATCH']
  }
});

// --- 🧩 Middleware ---
app.use(cors());
app.use(express.json());

// --- 🔗 MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

// --- 📡 API Routes ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const messageRoutes = require('./routes/message.routes');
const specialtyRoutes = require('./routes/specialty.routes');

app.use('/api/auth', authRoutes); // Đăng ký, đăng nhập
app.use('/api/users', userRoutes); // Thông tin người dùng
app.use('/api/appointments', appointmentRoutes); // Đặt lịch, hủy lịch
app.use('/api/medical-records', medicalRecordRoutes); // Hồ sơ bệnh án
app.use('/api/messages', messageRoutes); // Tin nhắn
app.use('/api/specialties', specialtyRoutes); // Danh sách chuyên khoa

// --- 🧯 Error Handling ---
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// --- 💬 Socket.IO Logic ---
require('./socket')(io); // File socket.js chứa logic realtime

// --- 🚀 Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});