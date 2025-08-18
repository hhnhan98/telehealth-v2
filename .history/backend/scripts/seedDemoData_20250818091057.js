const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Location = require("../models/Location");
const Specialty = require("../models/Specialty");
const Appointment = require("../models/Appointment");
const Schedule = require("../models/Schedule");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

// Giờ làm việc
const WORK_HOURS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"
];

const formatDate = d => d.toISOString().split("T")[0];
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
      Schedule.deleteMany({}),
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

    // ===== 3. Tạo Specialty =====
    const specialties = await Specialty.insertMany([
      { name: "Chuyên khoa 1", location: locations[0]._id },
      { name: "Chuyên khoa 2", location: locations[1]._id },
      { name: "Chuyên khoa 3", location: locations[2]._id },
    ]);

    // ===== 4. Tạo Doctor (gắn User, location, specialty) =====
    const doctors = [];
    for (let i = 0; i < doctorUsers.length; i++) {
      const doc = await Doctor.create({
        user: doctorUsers[i]._id,
        fullName: doctorUsers[i].fullName,
        location: locations[i % locations.length]._id,
        specialties: [specialties[i % specialties.length]._id]
      });
      doctors.push(doc);
      console.log(`Created doctor: ${doc._id} ${doc.fullName}`);
    }

    // ===== 5. Tạo Schedule cho mỗi doctor =====
    const daysRange = 7; // 7 ngày từ hôm nay
    const now = new Date();

    for (let doctor of doctors) {
      for (let i = 0; i < daysRange; i++) {
        const dateObj = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + i
        ));
        const dateStr = formatDate(dateObj);

        const slots = WORK_HOURS.map(time => {
          const [hour, minute] = time.split(":").map(Number);
          const datetime = new Date(dateObj);
          datetime.setUTCHours(hour - 7, minute, 0, 0); // Chuyển giờ VN -> UTC
          return { time, isBooked: false, datetime };
        });

        await Schedule.create({ doctorId: doctor._id, date: dateStr, slots });
      }
    }

    // ===== 6. Tạo Appointment cho bệnh nhân =====
    const statuses = ["pending", "confirmed", "completed"];
    const usedSlots = {};

    for (let patient of patientUsers) {
      let count = 0;
      while (count < 5) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const specialty = doctor.specialties[0];
        const location = doctor.location;

        const dayOffset = Math.floor(Math.random() * daysRange);
        const dateObj = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + dayOffset
        ));

        let hourMin = WORK_HOURS[Math.floor(Math.random() * WORK_HOURS.length)];
        const dateStr = formatDate(dateObj);
        const key = `${doctor._id}_${dateStr}_${hourMin}`;
        if (usedSlots[key]) continue;
        usedSlots[key] = true;

        const status = statuses[count % statuses.length];

        const [hour, minute] = hourMin.split(":").map(Number);
        const datetime = new Date(dateObj);
        datetime.setUTCHours(hour - 7, minute, 0, 0); // Chuyển giờ VN -> UTC

        const otp = status === "pending" ? generateOTP() : null;
        const otpExpiresAt = status === "pending" ? new Date(Date.now() + 5*60*1000) : null;

        await Appointment.create({
          location,
          specialty,
          doctor: doctor._id,
          datetime,
          patient: patient._id,
          reason: `Khám thử ${count+1}`,
          status,
          isVerified: status !== "pending",
          otp,
          otpExpiresAt
        });

        count++;
      }
    }

    console.log("^.^ Seed demo data UTC thành công!");
    process.exit();
  } catch (error) {
    console.error(">.< Seed dữ liệu thất bại", error);
    process.exit(1);
  }
}

seedDemoData();
n