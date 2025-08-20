const mongoose = require('mongoose');
const dayjs = require('dayjs');
const db = require('../db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Schedule = require('../models/Schedule');

const SALT_ROUNDS = 10;
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
  try {
    console.log('🗑️ Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Schedule.deleteMany({}),
    ]);

    console.log('✅ Old data cleared.');

    // --- 1. Seed Users ---
    const adminUser = new User({
      fullName: 'Admin Demo',
      email: 'admin@telehealth.com',
      password: await hashPassword('123456'),
      role: 'admin',
    });

    const patientUser = new User({
      fullName: 'Patient Demo',
      email: 'patient@telehealth.com',
      password: await hashPassword('123456'),
      role: 'patient',
    });

    const doctorUsers = [];
    for (let i = 1; i <= 4; i++) {
      doctorUsers.push(
        new User({
          fullName: `Doctor ${i}`,
          email: `doctor${i}@telehealth.com`,
          password: await hashPassword('123456'),
          role: 'doctor',
        })
      );
    }

    await Promise.all([adminUser.save(), patientUser.save(), ...doctorUsers.map(u => u.save())]);

    console.log('✅ Users seeded');

    // --- 2. Seed Patient ---
    const patient = new Patient({
      user: patientUser._id,
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Main St',
      medicalHistory: 'Không có tiền sử bệnh',
    });
    await patient.save();
    console.log('✅ Patient seeded');

    // --- 3. Seed Locations ---
    const location1 = new Location({ name: 'Cơ sở 1', address: 'Hà Nội' });
    const location2 = new Location({ name: 'Cơ sở 2', address: 'Hồ Chí Minh' });
    await Promise.all([location1.save(), location2.save()]);
    console.log('✅ Locations seeded');

    // --- 4. Seed Specialties ---
    const specialtiesData = [
      { name: 'Chuyên khoa 1', location: location1._id },
      { name: 'Chuyên khoa 2', location: location1._id },
      { name: 'Chuyên khoa 3', location: location2._id },
      { name: 'Chuyên khoa 4', location: location2._id },
    ];

    const specialties = await Promise.all(
      specialtiesData.map(data => new Specialty(data).save())
    );

    // --- 5. Seed Doctors ---
    const doctorData = [
      { user: doctorUsers[0]._id, specialty: specialties[0]._id, phone: '0987654321', bio: 'Bác sĩ chuyên khoa 1' },
      { user: doctorUsers[1]._id, specialty: specialties[1]._id, phone: '0987654322', bio: 'Bác sĩ chuyên khoa 2' },
      { user: doctorUsers[2]._id, specialty: specialties[2]._id, phone: '0987654323', bio: 'Bác sĩ chuyên khoa 3' },
      { user: doctorUsers[3]._id, specialty: specialties[3]._id, phone: '0987654324', bio: 'Bác sĩ chuyên khoa 4' },
    ];

    const doctors = await Promise.all(
      doctorData.map(d => new Doctor(d).save())
    );

    console.log('✅ Doctors seeded');

    // --- 6. Update specialties with doctor IDs ---
    for (let i = 0; i < specialties.length; i++) {
      specialties[i].doctors.push(doctors[i]._id);
      await specialties[i].save();
    }

    // --- 7. Generate Schedules for next 5 days, 8:00–11:00 & 13:00–17:00, 30 phút/lượt ---
    const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    const today = dayjs();

    for (const doctor of doctors) {
      for (let i = 0; i < 5; i++) {
        const date = today.add(i, 'day').format('YYYY-MM-DD');
        const slots = timeSlots.map(time => ({ time, isBooked: false }));

        const schedule = new Schedule({
          doctorId: doctor._id,
          date,
          slots,
        });
        await schedule.save();
      }
    }

    console.log('✅ Schedules generated for 5 days for all doctors');

    console.log('🎉 Seed demo data completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();


// // scripts/seedDemoData.js
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// const timezone = require("dayjs/plugin/timezone");
// require("dotenv").config();

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const User = require("../models/User");
// const Doctor = require("../models/Doctor");
// const Patient = require("../models/Patient");
// const Location = require("../models/Location");
// const Specialty = require("../models/Specialty");
// const Appointment = require("../models/Appointment");

// const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

// const WORK_HOURS = [
//   "08:00","08:30","09:00","09:30","10:00","10:30","11:00",
//   "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
// ];

// async function seedDemoData() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log(">>> Connected to MongoDB");

//     // Xóa dữ liệu cũ
//     await Promise.all([
//       User.deleteMany({}),
//       Doctor.deleteMany({}),
//       Patient.deleteMany({}),
//       Location.deleteMany({}),
//       Specialty.deleteMany({}),
//       Appointment.deleteMany({}),
//     ]);

//     const hashedPassword = await bcrypt.hash("123456", 10);

//     // ===== 1. Tạo User =====
//     const doctorUsers = await User.insertMany([
//       { fullName: "Bác sĩ 1", email: "doctor1@demo.com", password: hashedPassword, role: "doctor" },
//       { fullName: "Bác sĩ 2", email: "doctor2@demo.com", password: hashedPassword, role: "doctor" },
//       { fullName: "Bác sĩ 3", email: "doctor3@demo.com", password: hashedPassword, role: "doctor" },
//       { fullName: "Bác sĩ 4", email: "doctor4@demo.com", password: hashedPassword, role: "doctor" },
//       { fullName: "Bác sĩ 5", email: "doctor5@demo.com", password: hashedPassword, role: "doctor" },
//     ]);

//     const patientUsers = await User.insertMany([
//       { fullName: "Bệnh nhân 1", email: "patient1@demo.com", password: hashedPassword, role: "patient" },
//       { fullName: "Bệnh nhân 2", email: "patient2@demo.com", password: hashedPassword, role: "patient" },
//       { fullName: "Bệnh nhân 3", email: "patient3@demo.com", password: hashedPassword, role: "patient" },
//     ]);

//     // ===== 2. Tạo Location =====
//     const locations = await Location.insertMany([
//       { name: "Cơ sở 1", address: "Địa chỉ 1" },
//       { name: "Cơ sở 2", address: "Địa chỉ 2" },
//       { name: "Cơ sở 3", address: "Địa chỉ 3" },
//     ]);

//     // ===== 3. Tạo Specialty (gắn location) =====
//     const specialties = await Specialty.insertMany([
//       { name: "Chuyên khoa 1", location: locations[0]._id },
//       { name: "Chuyên khoa 2", location: locations[1]._id },
//       { name: "Chuyên khoa 3", location: locations[2]._id },
//       { name: "Chuyên khoa 4", location: locations[0]._id },
//       { name: "Chuyên khoa 5", location: locations[1]._id },
//     ]);

//     // ===== 4. Tạo Doctor (bảo đảm có doctor cho mỗi cặp location-specialty) =====
//     const doctors = [];
//     let doctorUserIndex = 0;
//     for (let loc of locations) {
//       for (let spec of specialties.filter(s => s.location.toString() === loc._id.toString())) {
//         const docUser = doctorUsers[doctorUserIndex % doctorUsers.length];
//         const doc = await Doctor.create({
//           user: docUser._id,
//           fullName: docUser.fullName,
//           specialty: spec._id,
//           location: loc._id,
//         });
//         doctors.push(doc);
//         doctorUserIndex++;
//       }
//     }

//     // ===== 5. Tạo Patient =====
//     const patients = [];
//     for (let i = 0; i < patientUsers.length; i++) {
//       const p = await Patient.create({
//         user: patientUsers[i]._id,
//         fullName: patientUsers[i].fullName,
//         dateOfBirth: new Date(`1990-0${i+1}-01`),
//         gender: i % 2 === 0 ? "male" : "female",
//         phone: `09123456${i}8`,
//         address: `Địa chỉ ${i+1}`
//       });
//       patients.push(p);
//     }

//     // ===== 6. Tạo Appointment demo =====
//     const statuses = ["pending", "confirmed", "completed"];
//     const appointments = [];
//     const usedSlots = {};

//     for (let patient of patients) {
//       let count = 0;
//       while (count < 3) { // mỗi bệnh nhân 3 lịch demo
//         const doctor = doctors[Math.floor(Math.random() * doctors.length)];
//         const specialty = doctor.specialty;
//         const location = doctor.location;

//         const dayOffset = Math.floor(Math.random() * 7) - 3; // +/- 3 ngày
//         const dateVN = dayjs().add(dayOffset, "day").tz("Asia/Ho_Chi_Minh");
//         const dateStr = dateVN.format("YYYY-MM-DD");

//         let hourMin = WORK_HOURS[Math.floor(Math.random() * WORK_HOURS.length)];
//         const key = `${doctor._id}_${dateStr}_${hourMin}`;
//         if (usedSlots[key]) continue; // tránh trùng slot
//         usedSlots[key] = true;

//         const status = statuses[count % statuses.length];

//         const datetimeUTC = dayjs.tz(`${dateStr} ${hourMin}`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh").utc().toDate();

//         appointments.push({
//           location,
//           specialty,
//           doctor: doctor._id,
//           date: dateStr,
//           time: hourMin,
//           datetime: datetimeUTC,
//           patient: patient._id,
//           reason: `Khám thử ${count+1}`,
//           status,
//           isVerified: status !== "pending"
//         });

//         count++;
//       }
//     }

//     await Appointment.insertMany(appointments);

//     console.log(">>> Seed demo data thành công!");
//     process.exit();
//   } catch (error) {
//     console.error("*** Seed dữ liệu thất bại", error);
//     process.exit(1);
//   }
// }

// seedDemoData();
