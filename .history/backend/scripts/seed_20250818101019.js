const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Specialty = require("../models/Specialty");
const Location = require("../models/Location");
const Appointment = require("../models/Appointment");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(">>> MongoDB connected for seeding...");

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Specialty.deleteMany(),
      Location.deleteMany(),
      Appointment.deleteMany(),
    ]);
    console.log(">>> Đã xóa toàn bộ dữ liệu cũ.");

    // Tạo specialties
    const specialties = await Specialty.insertMany([
      { name: "Nội tổng quát" },
      { name: "Nhi khoa" },
      { name: "Tim mạch" },
      { name: "Da liễu" },
    ]);

    // Tạo locations
    const locations = await Location.insertMany([
      { name: "Cơ sở Hà Nội", address: "123 Trần Duy Hưng, Hà Nội" },
      { name: "Cơ sở TP.HCM", address: "456 Nguyễn Huệ, TP.HCM" },
    ]);

    // Tạo user bác sĩ
    const hashedPassword = await bcrypt.hash("123456", 10);
    const doctorUser = await User.create({
      name: "Bác sĩ Nguyễn Văn A",
      email: "doctor@example.com",
      password: hashedPassword,
      role: "doctor",
    });

    // Tạo doctor profile gắn với user
    const doctor = await Doctor.create({
      user: doctorUser._id,
      specialty: specialties[0]._id,
      location: locations[0]._id,
      experience: "10 năm kinh nghiệm",
    });

    // Tạo user bệnh nhân
    const patientUser = await User.create({
      name: "Bệnh nhân Trần Thị B",
      email: "patient@example.com",
      password: hashedPassword,
      role: "patient",
    });

    // Tạo appointment (giờ UTC chuẩn hóa)
    const appointmentDate = new Date(Date.UTC(2025, 7, 20, 8, 30)); // 20/08/2025 08:30 UTC
    await Appointment.create({
      patient: patientUser._id,
      doctor: doctor._id,
      date: appointmentDate,
      status: "booked",
    });

    console.log(">>> Seed dữ liệu thành công!");
    process.exit();
  } catch (error) {
    console.error(">>> Seeding error:", error);
    process.exit(1);
  }
};

seed();
