const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
require("dotenv").config();

dayjs.extend(utc);
dayjs.extend(timezone);

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Location = require("../models/Location");
const Specialty = require("../models/Specialty");
const Appointment = require("../models/Appointment");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

const WORK_HOURS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
];

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(">>> Connected to MongoDB");

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Location.deleteMany({}),
      Specialty.deleteMany({}),
      Appointment.deleteMany({}),
    ]);

    const hashedPassword = await bcrypt.hash("123456", 10);

    // ===== 1. Tạo User =====
    const doctorUsers = await User.insertMany([
      { fullName: "Bác sĩ 1", email: "doctor1@demo.com", password: hashedPassword, role: "doctor" },
      { fullName: "Bác sĩ 2", email: "doctor2@demo.com", password: hashedPassword, role: "doctor" },
      { fullName: "Bác sĩ 3", email: "doctor3@demo.com", password: hashedPassword, role: "doctor" },
      { fullName: "Bác sĩ 4", email: "doctor4@demo.com", password: hashedPassword, role: "doctor" },
      { fullName: "Bác sĩ 5", email: "doctor5@demo.com", password: hashedPassword, role: "doctor" },
    ]);

    const patientUsers = await User.insertMany([
      { fullName: "Bệnh nhân 1", email: "patient1@demo.com", password: hashedPassword, role: "patient" },
      { fullName: "Bệnh nhân 2", email: "patient2@demo.com", password: hashedPassword, role: "patient" },
      { fullName: "Bệnh nhân 3", email: "patient3@demo.com", password: hashedPassword, role: "patient" },
    ]);

    // ===== 2. Tạo Location =====
    const locations = await Location.insertMany([
      { name: "Cơ sở 1" },
      { name: "Cơ sở 2" },
      { name: "Cơ sở 3" },
    ]);
    console.log("Locations:", locations.map(l => ({ id: l._id, name: l.name })));

    // ===== 3. Tạo Specialty (gắn location) =====
    const specialties = await Specialty.insertMany([
      { name: "Chuyên khoa 1", location: locations[0]._id },
      { name: "Chuyên khoa 2", location: locations[1]._id },
      { name: "Chuyên khoa 3", location: locations[2]._id },
      { name: "Chuyên khoa 4", location: locations[0]._id },
      { name: "Chuyên khoa 5", location: locations[1]._id },
    ]);
    console.log("Specialties:", specialties.map(s => ({ id: s._id, name: s.name, location: s.location })));

    // ===== 4. Tạo Doctor =====
    const doctors = [];
    let doctorUserIndex = 0;
    for (let loc of locations) {
      for (let spec of specialties.filter(s => s.location.toString() === loc._id.toString())) {
        const docUser = doctorUsers[doctorUserIndex % doctorUsers.length];
        const doc = await Doctor.create({
          user: docUser._id,
          fullName: docUser.fullName,
          specialty: spec._id,
          location: loc._id,
        });
        doctors.push(doc);
        doctorUserIndex++;
        console.log(`Doctor created: ${doc.fullName}, locationId: ${loc._id}, specialtyId: ${spec._id}`);
      }
    }

    // ===== 5. Tạo Patient =====
    const patients = [];
    for (let i = 0; i < patientUsers.length; i++) {
      const p = await Patient.create({
        user: patientUsers[i]._id,
        fullName: patientUsers[i].fullName,
        dateOfBirth: new Date(`1990-0${i+1}-01`),
        gender: i % 2 === 0 ? "male" : "female",
        phone: `09123456${i}8`,
      });
      patients.push(p);
    }

    // ===== 6. Tạo Appointment demo =====
    const statuses = ["pending", "confirmed", "completed"];
    const appointments = [];
    const usedSlots = {};

    for (let patient of patients) {
      let count = 0;
      while (count < 3) { // mỗi bệnh nhân 3 lịch demo
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const specialty = doctor.specialty;
        const location = doctor.location;

        const dayOffset = Math.floor(Math.random() * 7) - 3; // +/- 3 ngày
        const dateVN = dayjs().add(dayOffset, "day").tz("Asia/Ho_Chi_Minh");
        const dateStr = dateVN.format("YYYY-MM-DD");

        let hourMin = WORK_HOURS[Math.floor(Math.random() * WORK_HOURS.length)];
        const key = `${doctor._id}_${dateStr}_${hourMin}`;
        if (usedSlots[key]) continue; // tránh trùng slot
        usedSlots[key] = true;

        const status = statuses[count % statuses.length];
        const datetimeUTC = dayjs.tz(`${dateStr} ${hourMin}`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh").utc().toDate();

        appointments.push({
          location,
          specialty,
          doctor: doctor._id,
          date: dateStr,
          time: hourMin,
          datetime: datetimeUTC,
          patient: patient._id,
          reason: `Khám thử ${count+1}`,
          status,
          isVerified: status !== "pending"
        });

        count++;
      }
    }

    await Appointment.insertMany(appointments);

    console.log(">>> Seed demo data thành công!");
    process.exit();
  } catch (error) {
    console.error("*** Seed dữ liệu thất bại", error);
    process.exit(1);
  }
}

seedDemoData();

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
