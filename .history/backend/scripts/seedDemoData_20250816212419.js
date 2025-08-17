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
    for (let i = 0; i < specialtyNames.length; i++) {
      const spec = await Specialty.create({
        name: specialtyNames[i],
        location: [locations[i % locations.length]._id]
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
        specialty: specialties[i - 1]._id
      });

      const doctor = await Doctor.create({
        fullName: doctorUser.fullName,
        specialties: [specialties[i - 1]._id],
        location: locations[i - 1]._id
      });

      doctors.push({ user: doctorUser, doctor });
    }

    // --- Tạo bệnh nhân ---
    const patients = [];
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const patient = await User.create({
        fullName: `Bệnh nhân ${i}`,
        email: `patient${i}@demo.com`,
        password: hashedPassword,
        role: 'patient'
      });
      patients.push(patient);
    }

    // --- Tạo lịch hẹn demo cho mỗi bệnh nhân ---
    const demoStatuses = ['pending', 'confirmed', 'confirmed', 'pending', 'cancelled', 'cancelled', 'confirmed'];

    for (let pat of patients) {
      for (let i = 0; i < demoStatuses.length; i++) {
        let slotCreated = false;
        while (!slotCreated) {
          const docObj = doctors[Math.floor(Math.random() * doctors.length)];
          const apptDate = new Date();
          apptDate.setDate(apptDate.getDate() + i - 3); // offset từ -3 → +3
          const hour = 9 + Math.floor(Math.random() * 8); // 9–16h
          apptDate.setHours(hour, 0, 0, 0);

          const dateStr = formatDate(apptDate);
          const timeStr = `${hour.toString().padStart(2, '0')}:00`;

          const exists = await Appointment.findOne({
            doctor: docObj.doctor._id,
            date: dateStr,
            time: timeStr
          });
          if (exists) continue;

          await Appointment.create({
            location: docObj.doctor.location,
            specialty: docObj.user.specialty,
            doctor: docObj.doctor._id,
            date: dateStr,
            time: timeStr,
            datetime: apptDate,
            patient: pat._id,
            status: demoStatuses[i]
          });

          slotCreated = true;
        }
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
