const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Location = require("../models/Location");
const Specialty = require("../models/Specialty");
const Appointment = require("../models/Appointment");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

// Giờ làm việc
const WORK_HOURS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
];

const formatDate = d => d.toISOString().split("T")[0];

async function seedDemoData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(">>> Connected to MongoDB");

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
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
    ]);

    const patientUsers = await User.insertMany([
      { fullName: "Bệnh nhân 1", email: "patient1@demo.com", password: hashedPassword, role: "patient" },
      { fullName: "Bệnh nhân 2", email: "patient2@demo.com", password: hashedPassword, role: "patient" },
      { fullName: "Bệnh nhân 3", email: "patient3@demo.com", password: hashedPassword, role: "patient" },
    ]);

    // ===== 2. Tạo Location =====
    const locations = await Location.insertMany([
      { name: "Cơ sở 1", address: "Địa chỉ 1" },
      { name: "Cơ sở 2", address: "Địa chỉ 2" },
      { name: "Cơ sở 3", address: "Địa chỉ 3" },
    ]);

    // ===== 3. Tạo Specialty (gắn location) =====
    const specialties = await Specialty.insertMany([
      { name: "Chuyên khoa 1", location: locations[0]._id },
      { name: "Chuyên khoa 2", location: locations[1]._id },
      { name: "Chuyên khoa 3", location: locations[2]._id },
    ]);

    // ===== 4. Tạo Doctor (gắn specialty & location) =====
    const doctors = [];
    for (let i = 0; i < doctorUsers.length; i++) {
      const doc = await Doctor.create({
        user: doctorUsers[i]._id,
        fullName: doctorUsers[i].fullName,
        location: locations[i % locations.length]._id,
        specialties: [specialties[i % specialties.length]._id]
      });
      doctors.push(doc);
    }

    // ===== 5. Tạo Appointment =====
    const statuses = ["pending", "confirmed", "completed"];
    const appointments = [];
    const usedSlots = {};

    for (let patient of patientUsers) {
      let count = 0;
      while (count < 5) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const specialty = doctor.specialties[0];
        const location = doctor.location;

        const dayOffset = Math.floor(Math.random() * 7) - 3; // 3 ngày trước/sau
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() + dayOffset);

        let hourMin = WORK_HOURS[Math.floor(Math.random() * WORK_HOURS.length)];

        const dateStr = formatDate(dateObj);
        const key = `${doctor._id}_${dateStr}_${hourMin}`;
        if (usedSlots[key]) continue;
        usedSlots[key] = true;

        const status = statuses[count % statuses.length];

        const [hour, minute] = hourMin.split(":");
        const datetime = new Date(dateObj);
        datetime.setHours(parseInt(hour), parseInt(minute), 0, 0);

        appointments.push({
          location,
          specialty,
          doctor: doctor._id,
          date: dateStr,
          time: hourMin,
          datetime,
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
