const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const formatDate = d => d.toISOString().split('T')[0]; // YYYY-MM-DD

async function seedDemoData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('>>> Kết nối MongoDB thành công');

    // --- Xóa dữ liệu cũ ---
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Specialty.deleteMany({}),
      Location.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    // --- Tạo locations ---
    const locations = [];
    for (let i = 1; i <= 3; i++) {
      const loc = await Location.create({ name: `Cơ sở ${i}` });
      locations.push(loc);
    }

    // --- Tạo specialties ---
    const specialties = [];
    const specialtyNames = ['Nhi khoa', 'Tim mạch', 'Da liễu'];
    for (let name of specialtyNames) {
      const spec = await Specialty.create({
        name,
        location: locations.map(l => l._id) // tất cả cơ sở đều có 3 chuyên khoa
      });
      specialties.push(spec);
    }

    // --- Tạo bác sĩ ---
    const doctors = [];
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const doctorUser = await User.create({
        fullName: `Bác sĩ ${i}`,
        email: `doctor${i}@demo.com`,
        password: hashedPassword,
        role: 'doctor',
        specialty: specialties[i - 1]._id // mỗi bác sĩ 1 chuyên khoa
      });

      const doctor = await Doctor.create({
        fullName: doctorUser.fullName,
        specialties: [specialties[i - 1]._id],
        location: locations[i - 1]._id
      });

      doctors.push({ user: doctorUser, doctor });

      console.log(`>>> Tài khoản bác sĩ: email=${doctorUser.email}, password=123456`);
    }

    // --- Tạo bệnh nhân ---
    const patients = [];
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const patientUser = await User.create({
        fullName: `Bệnh nhân ${i}`,
        email: `patient${i}@demo.com`,
        password: hashedPassword,
        role: 'patient'
      });
      patients.push(patientUser);

      console.log(`>>> Tài khoản bệnh nhân: email=${patientUser.email}, password=123456`);
    }

    // --- Tạo lịch hẹn demo ---
    const demoStatuses = ['pending', 'confirmed', 'completed'];
    const today = new Date();

    for (let pat of patients) {
      let appointmentsCreated = 0;
      while (appointmentsCreated < 5) {
        // Ngày random từ -7 → +7
        const dayOffset = Math.floor(Math.random() * 15) - 7;
        const apptDate = new Date(today);
        apptDate.setDate(today.getDate() + dayOffset);

        // Chọn bác sĩ phù hợp random
        const docObj = doctors[Math.floor(Math.random() * doctors.length)];
        const doctor = docObj.doctor;

        // Giờ khám random 9–16h
        const hour = 9 + Math.floor(Math.random() * 8);
        apptDate.setHours(hour, 0, 0, 0);
        const dateStr = formatDate(apptDate);
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;

        // Kiểm tra trùng giờ bác sĩ
        const exists = await Appointment.findOne({
          doctor: doctor._id,
          date: dateStr,
          time: timeStr
        });
        if (exists) continue;

        const status = demoStatuses[Math.floor(Math.random() * demoStatuses.length)];

        await Appointment.create({
          location: doctor.location,
          specialty: doctor.specialties[0],
          doctor: doctor._id,
          date: dateStr,
          time: timeStr,
          datetime: apptDate,
          patient: pat._id,
          status
        });

        appointmentsCreated++;
      }
    }

    console.log('>>> Hoàn tất seed dữ liệu');
    process.exit(0);
  } catch (err) {
    console.error('*** Seed dữ liệu thất bại ***', err);
    process.exit(1);
  }
}

seedDemoData();
