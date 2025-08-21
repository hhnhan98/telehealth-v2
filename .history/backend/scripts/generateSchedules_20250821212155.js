// scripts/generateSchedules.js
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');

// Giờ làm việc cố định
const WORK_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/telehealth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const generateSchedules = async () => {
  try {
    const doctors = await Doctor.find();

    const today = new Date();
    for (let i = 0; i < 7; i++) { // 7 ngày tiếp theo
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + i);
      const dateStr = dateObj.toISOString().split('T')[0];

      for (const doctor of doctors) {
        const existing = await Schedule.findOne({ doctor: doctor._id, date: dateStr });
        if (existing) continue; // đã có schedule

        const slots = WORK_HOURS.map(time => ({ time, isBooked: false }));
        const schedule = new Schedule({ doctor: doctor._id, date: dateStr, slots });
        await schedule.save();
        
        console.log(`Tạo schedule cho ${doctor.fullName} ngày ${dateStr}`);
      }
    }

    console.log('Tạo schedule hoàn tất!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Lỗi tạo schedule:', err);
    mongoose.disconnect();
  }
};

// Nếu muốn chạy định kỳ, có thể dùng node-cron hoặc pm2 cron
generateSchedules();
