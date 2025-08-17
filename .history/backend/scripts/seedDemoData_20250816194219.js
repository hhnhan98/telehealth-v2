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
    const specialtyNames = ['Nhi khoa', 'Tim mạch', 'Da liễu', 'Thần kinh', 'Tai mũi họng'];
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
        specialty: specialties[i % specialties.length]._id
      });

      const doctor = await Doctor.create({
        fullName: doctorUser.fullName,
        specialties: [specialties[i % specialties.length]._id],
        location: locations[i % locations.length]._id
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

    const statuses = ['pending', 'confirmed', 'cancelled'];

    // --- Tạo 7 lịch demo cho mỗi bệnh nhân ---
    for (let pat of patients) {
      const demoStatuses = [
        { offset: -4, status: 'confirmed' },
        { offset: -3, status: 'confirmed' },
        { offset: -2, status: 'confirmed' },
        { offset: -1, status: 'confirmed' },
        { offset: 0, status: 'cancelled' },
        { offset: 1, status: 'pending' },
        { offset: 2, status: 'confirmed' }
      ];

      for (let s of demoStatuses) {
        const docObj = doctors[Math.floor(Math.random() * doctors.length)];

        const apptDate = new Date();
        apptDate.setDate(apptDate.getDate() + s.offset);
        const hour = 9 + Math.floor(Math.random() * 8); // 9–16h
        apptDate.setHours(hour, 0, 0, 0);

        const dateStr = formatDate(apptDate);
        const timeStr = `${hour.toString().padStart(2,'0')}:00`;

        // Tránh trùng slot
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
          patient: {
            _id: pat._id,
            fullName: pat.fullName,
            email: pat.email
          },
          status: s.status
        });
      }
    }

    // --- Tạo lịch cho bác sĩ (3 slot/ngày, 14 ngày tới) ---
    const today = new Date();
    for (let doc of doctors) {
      for (let i = 0; i < 14; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() + i);

        let createdSlots = 0;
        while (createdSlots < 3) {
          const hour = 9 + Math.floor(Math.random() * 8); // 9–16h
          const apptDate = new Date(day);
          apptDate.setHours(hour, 0, 0, 0);
          const dateStr = formatDate(apptDate);
          const timeStr = `${hour.toString().padStart(2,'0')}:00`;

          const exists = await Appointment.findOne({
            doctor: doc.doctor._id,
            date: dateStr,
            time: timeStr
          });
          if (exists) continue;

          const patient = patients[Math.floor(Math.random() * patients.length)];

          await Appointment.create({
            location: doc.doctor.location,
            specialty: doc.user.specialty,
            doctor: doc.doctor._id,
            date: dateStr,
            time: timeStr,
            datetime: apptDate,
            patient: {
              _id: patient._id,
              fullName: patient.fullName,
              email: patient.email
            },
            status: statuses[Math.floor(Math.random() * statuses.length)]
          });

          createdSlots++;
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
