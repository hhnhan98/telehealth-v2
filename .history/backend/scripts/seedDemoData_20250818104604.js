// scripts/seedDemoData.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Specialty = require("../models/Specialty");
const Location = require("../models/Location");
const Appointment = require("../models/Appointment");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI chưa được định nghĩa trong .env");
  process.exit(1);
}

async function seedDemoData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear cũ
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Specialty.deleteMany(),
      Location.deleteMany(),
      Appointment.deleteMany(),
    ]);

    // Seed Locations
    const locations = await Location.insertMany([
      { name: "Cơ sở Hà Nội", address: "123 Phố Huế, Hà Nội" },
      { name: "Cơ sở TP.HCM", address: "456 Nguyễn Huệ, TP.HCM" },
    ]);
    console.log("✅ Seeded Locations");

    // Seed Specialties
    const specialties = await Specialty.insertMany([
      { name: "Nội tổng quát" },
      { name: "Nhi khoa" },
      { name: "Tim mạch" },
    ]);
    console.log("✅ Seeded Specialties");

    // Seed Doctors + Users
    const hashedPw = await bcrypt.hash("123456", 10);

    const doctorUsers = await User.insertMany([
      {
        name: "BS. Nguyễn Văn A",
        email: "doctorA@example.com",
        password: hashedPw,
        role: "doctor",
      },
      {
        name: "BS. Trần Thị B",
        email: "doctorB@example.com",
        password: hashedPw,
        role: "doctor",
      },
    ]);

    const doctors = await Doctor.insertMany([
      {
        user: doctorUsers[0]._id,
        specialty: specialties[0]._id,
        location: locations[0]._id,
      },
      {
        user: doctorUsers[1]._id,
        specialty: specialties[1]._id,
        location: locations[1]._id,
      },
    ]);
    console.log("✅ Seeded Doctors & Users");

    // Seed bệnh nhân
    const patientUser = await User.create({
      name: "Nguyễn Văn C",
      email: "patient@example.com",
      password: hashedPw,
      role: "patient",
    });

    // Seed Appointments (khớp schema)
    const appointments = await Appointment.insertMany([
      {
        patient: patientUser._id,
        doctor: doctors[0]._id,
        specialty: specialties[0]._id,
        location: locations[0]._id,
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000), // ngày mai
        status: "pending", // dùng giá trị hợp lệ
      },
      {
        patient: patientUser._id,
        doctor: doctors[1]._id,
        specialty: specialties[1]._id,
        location: locations[1]._id,
        datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 ngày sau
        status: "confirmed",
      },
    ]);
    console.log("✅ Seeded Appointments");

    console.log("🎉 Seed demo data thành công!");
    process.exit(0);
  } catch (err) {
    console.error(">.< Seed thất bại:", err);
    process.exit(1);
  }
}

seedDemoData();
