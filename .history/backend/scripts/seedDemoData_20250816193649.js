const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

const formatDate = d => d.toISOString().split('T')[0];

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
      const specialty = specialties[i - 1];
      const doctorUser = await User.create({
        fullName: `Bác sĩ ${i}`,
        email: `doctor${i}@demo.com`,
        password: hashedPassword,
        role: 'doctor',
        specialty: specialty._id
      });
      const doctor = await Doctor.create({
        fullName: doctorUser.fullName,
        specialties: [specialty._id],
        location: specialty.location[0]
      });
      doctors.push({ user: doctorUser, doctor, specialty });
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

    const appointments = [];
    const today = new Date();

    // --- Lịch bác sĩ: ít nhất 3 slot/ngày trong 14 ngày tới ---
    const daysToSeed = 14;
    for (let dayOffset = 0; dayOffset < daysToSeed; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);
      const dateStr = formatDate(currentDay);

      for (let docObj of doctors) {
        const doc = docObj.doctor;
        const specialty = docObj.specialty;
        const location = doc.location;

        const hours = [];
        while (hours.length < 3) {
          const h = 8 + Math.floor(Math.random() * 10);
          if (!hours.includes(h)) hours.push(h);
        }

        for (let i = 0; i < hours.length; i++) {
          const hour = hours[i];
          const timeStr = `${hour.toString().padStart(2,'0')}:00`;
          const patient = patients[i % patients.length];
          const apptDate = new Date(currentDay);
          apptDate.setHours(hour, 0, 0, 0);

          const exists = await Appointment.findOne({
            doctor: doc._id,
            date: dateStr,
            time: timeStr
          });
          if (exists) continue;

          const appt = await Appointment.create({
            location,
            specialty: specialty._id,
            doctor: doc._id,
            date: dateStr,
            time: timeStr,
            datetime: apptDate,
            patient: {
              _id: patient._id,
              fullName: patient.fullName,
              email: patient.email
            },
            status: 'confirmed'
          });
          appointments.push(appt);
        }
      }
    }

    // --- Lịch bệnh nhân: 7 slot/bệnh nhân với trạng thái yêu cầu ---
    for (let pat of patients) {
      const statusMap = [
        { offset: -4, status: 'confirmed' }, // đã hết hạn
        { offset: -3, status: 'confirmed' },
        { offset: -2, status: 'confirmed' },
        { offset: -1, status: 'confirmed' },
        { offset: 0, status: 'cancelled' }, // hủy
        { offset: 1, status: 'pending' },   // chờ xác thực
        { offset: 2, status: 'confirmed' }  // chưa tới hạn
      ];

      for (let s of statusMap) {
        const docObj = doctors[Math.floor(Math.random() * doctors.length)];
        const doc = docObj.doctor;
        const specialty = docObj.specialty;
        const location = doc.location;

        const apptDate = new Date(today);
        apptDate.setDate(today.getDate() + s.offset);
        const hour = 9 + Math.floor(Math.random() * 8); // 9-16h
        apptDate.setHours(hour, 0, 0, 0);
        const dateStr = formatDate(apptDate);
        const timeStr = `${hour.toString().padStart(2,'0')}:00`;

        const exists = await Appointment.findOne({
          doctor: doc._id,
          date: dateStr,
          time: timeStr
        });
        if (exists) continue;

        const appt = await Appointment.create({
          location,
          specialty: specialty._id,
          doctor: doc._id,
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
