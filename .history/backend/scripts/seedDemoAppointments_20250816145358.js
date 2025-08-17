require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const seedAppointments = async () => {
  try {
    // Xóa các lịch cũ
    await Appointment.deleteMany({});

    // Lấy bệnh nhân và bác sĩ
    const patients = await User.find({ role: 'patient' });
    const doctors = await User.find({ role: 'doctor' });

    if (patients.length === 0 || doctors.length === 0) {
      console.log('Chưa có bệnh nhân hoặc bác sĩ để tạo lịch demo');
      process.exit(0);
    }

    const appointments = [];

    const today = new Date();
    today.setHours(0,0,0,0);

    // Tạo demo mỗi bác sĩ 2-3 lịch trong tuần
    doctors.forEach((doc, i) => {
      for (let j = 0; j < 3; j++) {
        const patient = patients[(i + j) % patients.length];
        const date = new Date(today);
        date.setDate(today.getDate() + j); // hôm nay + j ngày
        date.setHours(9 + j, 0, 0, 0); // giờ 9h, 10h, 11h
        appointments.push({
          doctor: doc._id,
          patient: patient._id,
          date,
          time: date,
          status: 'pending',
        });
      }
    });

    await Appointment.insertMany(appointments);
    console.log('>>> Seed lịch khám demo thành công');
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed lịch demo:', err);
    process.exit(1);
  }
};

seedAppointments();
