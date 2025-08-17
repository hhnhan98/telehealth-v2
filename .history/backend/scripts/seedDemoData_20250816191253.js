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

    // --- Tạo lịch hẹn ---
    const statuses = ['pending', 'confirmed', 'cancelled'];
    const appointments = [];
    const startSeedDate = new Date('2025-08-16');
    const endSeedDate = new Date('2025-08-31');

    // Mỗi bác sĩ 3 slot/ngày 9–11h
    for (let doc of doctors) {
      for (let d = new Date(startSeedDate); d <= endSeedDate; d.setDate(d.getDate() + 1)) {
        for (let hour = 9; hour <= 11; hour++) {
          const patient = patients[Math.floor(Math.random() * patients.length)];
          const apptDate = new Date(d);
          apptDate.setHours(hour, 0, 0, 0);
          const dateStr = formatDate(apptDate);
          const timeStr = `${hour.toString().padStart(2,'0')}:00`;

          // Kiểm tra trùng slot
          const exists = await Appointment.findOne({
            doctor: doc.doctor._id,
            date: dateStr,
            time: timeStr
          });
          if (exists) continue;

          const appt = await Appointment.create({
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

          appointments.push(appt);
        }
      }
    }

    // Mỗi bệnh nhân thêm 3 slot ngẫu nhiên 12–16h
    for (let pat of patients) {
      let added = 0;
      while (added < 3) {
        const doc = doctors[Math.floor(Math.random() * doctors.length)];
        const randDay = new Date(startSeedDate);
        randDay.setDate(randDay.getDate() + Math.floor(Math.random() * (endSeedDate.getDate() - startSeedDate.getDate() + 1)));
        const hour = 12 + Math.floor(Math.random() * 5);
        const apptDate = new Date(randDay);
        apptDate.setHours(hour, 0, 0, 0);
        const dateStr = formatDate(apptDate);
        const timeStr = `${hour.toString().padStart(2,'0')}:00`;

        // Kiểm tra trùng
        const exists = await Appointment.findOne({
          doctor: doc.doctor._id,
          date: dateStr,
          time: timeStr
        });
        if (exists) continue;

        const appt = await Appointment.create({
          location: doc.doctor.location,
          specialty: doc.user.specialty,
          doctor: doc.doctor._id,
          date: dateStr,
          time: timeStr,
          datetime: apptDate,
          patient: {
            _id: pat._id,
            fullName: pat.fullName,
            email: pat.email
          },
          status: statuses[Math.floor(Math.random() * statuses.length)]
        });

        appointments.push(appt);
        added++;
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

    // --- In ra terminal ---
    console.log(`>>> Seed thành công: ${doctors.length} bác sĩ, ${patients.length} bệnh nhân, ${appointments.length} lịch hẹn.`);
    
    console.log('--- Danh sách bác sĩ ---');
    doctors.forEach(d => console.log(`${d.user.fullName} | Email: ${d.user.email}`));

    console.log('--- Danh sách bệnh nhân ---');
    patients.forEach(p => console.log(`${p.fullName} | Email: ${p.email}`));

    console.log(`--- Tổng số lịch hẹn: ${appointments.length} ---`);

    process.exit(0);

  } catch (err) {
    console.error('*** Lỗi seed demo:', err);
    process.exit(1);
  }
}

seedDemoData();
