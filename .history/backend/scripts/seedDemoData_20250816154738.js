const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

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

    // --- Tạo Cơ sở ---
    const locations = [];
    for (let i = 1; i <= 3; i++) {
      const loc = await Location.create({ name: `Cơ sở ${i}` });
      locations.push(loc);
    }

    // --- Tạo Chuyên khoa ---
    const specialties = [];
    const specialtyNames = ['Nhi khoa', 'Tim mạch', 'Da liễu', 'Thần kinh', 'Tai mũi họng'];
    for (let i = 0; i < specialtyNames.length; i++) {
      const spec = await Specialty.create({
        name: specialtyNames[i],
        location: [locations[i % locations.length]._id]
      });
      specialties.push(spec);
    }

    // --- Tạo Bác sĩ ---
    const doctors = [];
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const doctorUser = await User.create({
        fullName: `Bác sĩ ${i}`,
        email: `doctor${i}@demo.com`,
        password: hashedPassword,
        role: 'doctor',
        specialty: specialties[i % specialties.length]._id
      });

      const doctor = await Doctor.create({
        fullName: doctorUser.fullName,
        specialties: [specialties[i % specialties.length]._id],
        location: locations[i % locations.length]._id
      });

      doctors.push({ user: doctorUser, doctor });
    }

    // --- Tạo Bệnh nhân ---
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

    // --- Tạo Lịch hẹn ---
    const statuses = ['pending', 'confirmed', 'cancelled'];
    const appointments = [];

    // Mỗi bác sĩ 3 lịch/ngày trong 7 ngày
    for (let doc of doctors) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toISOString().slice(0, 10);

        for (let slot = 9; slot <= 11; slot++) {
          const timeStr = `${slot}:00`;
          const patient = patients[Math.floor(Math.random() * patients.length)];

          const appt = await Appointment.create({
            location: doc.doctor.location,
            specialty: doc.user.specialty,
            doctor: doc.doctor._id,
            date: dateStr,
            time: timeStr,
            patient: {
              _id: patient._id,
              fullName: patient.fullName,
              email: patient.email
            },
            status: statuses[Math.floor(Math.random() * statuses.length)]
          });

          appointments.push(appt);
        }
      }
    }

    // Mỗi bệnh nhân tối đa 3 lịch với đủ trạng thái
    for (let pat of patients) {
      const selectedStatuses = [...statuses];
      for (let i = 0; i < 3; i++) {
        const doc = doctors[Math.floor(Math.random() * doctors.length)];
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 7));
        const dateStr = date.toISOString().slice(0, 10);
        const timeStr = `${12 + i}:00`;

        const status = selectedStatuses.shift(); // đảm bảo đủ 3 trạng thái

        const appt = await Appointment.create({
          location: doc.doctor.location,
          specialty: doc.user.specialty,
          doctor: doc.doctor._id,
          date: dateStr,
          time: timeStr,
          patient: {
            _id: pat._id,
            fullName: pat.fullName,
            email: pat.email
          },
          status
        });

        appointments.push(appt);
      }
    }

    console.log(`>>> Seed thành công: ${doctors.length} bác sĩ, ${patients.length} bệnh nhân, ${appointments.length} lịch hẹn.`);
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
}

seedDemoData();
