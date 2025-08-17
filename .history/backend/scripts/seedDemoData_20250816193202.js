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

    // --- Tạo specialties và liên kết location ---
    const specialties = [];
    const specialtyNames = ['Nhi khoa', 'Tim mạch', 'Da liễu'];
    for (let i = 0; i < specialtyNames.length; i++) {
      const spec = await Specialty.create({
        name: specialtyNames[i],
        location: [locations[i % locations.length]._id] // mỗi specialty gắn 1 cơ sở
      });
      specialties.push(spec);
    }

    // --- Tạo bác sĩ ---
    const doctors = [];
    for (let i = 1; i <= 3; i++) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      const specialty = specialties[i - 1]; // mỗi bác sĩ 1 chuyên ngành
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

    const statuses = ['pending', 'confirmed', 'cancelled'];
    const appointments = [];
    const today = new Date();
    const daysToSeed = 14;

    // --- Tạo lịch cho bác sĩ (ít nhất 3 slot/ngày) ---
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
          const h = 8 + Math.floor(Math.random() * 10); // 8-17h
          if (!hours.includes(h)) hours.push(h);
        }

        for (let i = 0; i < hours.length; i++) {
          const hour = hours[i];
          const timeStr = `${hour.toString().padStart(2,'0')}:00`;
          const patient = patients[i % patients.length];
          const status = statuses[i % statuses.length];
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
            status
          });
          appointments.push(appt);
        }
      }
    }

    // --- Mỗi bệnh nhân thêm 3 lịch thể hiện 3 trạng thái ---
    for (let i = 0; i < patients.length; i++) {
      const pat = patients[i];
      for (let j = 0; j < statuses.length; j++) {
        const docObj = doctors[j % doctors.length];
        const doc = docObj.doctor;
        const specialty = docObj.specialty;
        const location = doc.location;

        const d = new Date(today);
        const dayOffset = Math.floor(Math.random() * daysToSeed);
        d.setDate(d.getDate() + dayOffset);
        const hour = 12 + j; // 12,13,14h
        const timeStr = `${hour.toString().padStart(2,'0')}:00`;
        d.setHours(hour, 0, 0, 0);
        const dateStr = formatDate(d);

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
          datetime: d,
          patient: {
            _id: pat._id,
            fullName: pat.fullName,
            email: pat.email
          },
          status: statuses[j]
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
