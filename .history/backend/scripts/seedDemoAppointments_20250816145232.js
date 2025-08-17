// seed/seedDemoAppointments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const reasons = [
  'Khám định kỳ',
  'Sốt cao',
  'Ho lâu ngày',
  'Đau bụng',
  'Khám tổng quát'
];

// Sinh ngẫu nhiên giờ khám trong ngày
const generateRandomTime = (date) => {
  const hour = 8 + Math.floor(Math.random() * 9); // 8-16h
  const minute = Math.random() < 0.5 ? 0 : 30;    // 0 hoặc 30 phút
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const seedAppointments = async () => {
  try {
    // Xóa dữ liệu cũ
    await Appointment.deleteMany({});
    console.log('>>> Xóa lịch khám cũ');

    const doctors = await Doctor.find({});
    const patients = await User.find({ role: 'patient' });

    if (doctors.length === 0 || patients.length === 0) {
      console.error('*** Chưa có bác sĩ hoặc bệnh nhân trong DB');
      process.exit(1);
    }

    const appointments = [];

    // Tạo lịch cho 7 ngày tới
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      for (const doctor of doctors) {
        const slotsPerDay = 3 + Math.floor(Math.random() * 3); // 3-5 lượt/ngày

        for (let j = 0; j < slotsPerDay; j++) {
          const patient = patients[Math.floor(Math.random() * patients.length)];

          appointments.push({
            doctor: doctor._id,
            patient: patient._id,
            time: generateRandomTime(date),
            status: 'pending',
            reason: reasons[Math.floor(Math.random() * reasons.length)],
          });
        }
      }
    }

    await Appointment.insertMany(appointments);
    console.log(`>>> Seed ${appointments.length} lịch khám thành công`);
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed lịch khám:', err);
    process.exit(1);
  }
};

seedAppointments();
