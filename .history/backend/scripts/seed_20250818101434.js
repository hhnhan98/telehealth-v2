const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Specialty = require("../models/Specialty");
const Location = require("../models/Location");
const Appointment = require("../models/Appointment");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đã kết nối MongoDB");

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Specialty.deleteMany(),
      Location.deleteMany(),
      Appointment.deleteMany(),
    ]);
    console.log("Đã xóa dữ liệu cũ");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 1. Tạo cơ sở
    const locationNames = ["Cơ sở 1", "Cơ sở 2", "Cơ sở 3"];
    const locations = await Location.insertMany(
      locationNames.map((name, i) => ({
        name,
        address: `Địa chỉ số ${i + 1}`,
      }))
    );

    // 2. Tạo chuyên khoa
    const specialtyNames = ["Nội tổng quát", "Tim mạch", "Da liễu"];
    const specialties = await Specialty.insertMany(
      specialtyNames.map((name) => ({ name }))
    );

    // 3. Tạo bác sĩ (3 bác sĩ, mỗi bác sĩ thuộc 1 chuyên khoa + cơ sở)
    const doctorUsers = await User.insertMany(
      [1, 2, 3].map((i) => ({
        fullName: `Bác sĩ ${i}`,
        email: `doctor${i}@example.com`,
        password: hashedPassword,
        role: "doctor",
      }))
    );

    const doctors = await Doctor.insertMany(
      doctorUsers.map((user, i) => ({
        user: user._id,
        specialty: specialties[i]._id,
        location: locations[i]._id,
        experience: `${5 + i} năm kinh nghiệm`,
      }))
    );

    // 4. Tạo bệnh nhân (5 bệnh nhân)
    const patientUsers = await User.insertMany(
      [1, 2, 3, 4, 5].map((i) => ({
        fullName: `Bệnh nhân ${i}`,
        email: `patient${i}@example.com`,
        password: hashedPassword,
        role: "patient",
      }))
    );

    // 5. Tạo lịch hẹn (10 lịch hẹn cho cả bệnh nhân và bác sĩ)
    const reasons = ["Khám sức khỏe định kỳ", "Tư vấn tim mạch", "Khám da liễu"];
    const today = new Date();

    const appointments = [];

    for (let i = 0; i < 10; i++) {
      const date = new Date(Date.UTC(2025, 7, 18 + Math.floor(i / 3), 8 + (i % 6), 0));
      appointments.push({
        patient: patientUsers[i % patientUsers.length]._id,
        doctor: doctors[i % doctors.length]._id,
        date,
        status: i % 3 === 0 ? "completed" : "booked",
        reason: reasons[i % reasons.length],
      });
    }

    await Appointment.insertMany(appointments);

    console.log("Seed dữ liệu thành công");
    process.exit();
  } catch (error) {
    console.error("Lỗi khi seed:", error);
    process.exit(1);
  }
}

seed();
