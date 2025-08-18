// backend/scripts/seedDemoData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const Appointment = require('../models/Appointment');

dotenv.config();

async function seedDemoData() {
  try {
    const MONGO_URI = process.env.MONGODB_URL;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URL chưa được định nghĩa trong .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('>>> Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany(),
      Doctor.deleteMany(),
      Specialty.deleteMany(),
      Location.deleteMany(),
      Appointment.deleteMany()
    ]);

    // Seed Locations
    const locations = await Location.insertMany([
      { name: 'Cơ sở Hà Nội' },
      { name: 'Cơ sở TP.HCM' },
      { name: 'Cơ sở Đà Nẵng' }
    ]);
    console.log('>>> Seeded Locations');

    // Seed Specialties
    const specialties = await Specialty.insertMany([
      { name: 'Nội khoa', location: [locations[0]._id, locations[1]._id] },
      { name: 'Ngoại khoa', location: [locations[0]._id] },
      { name: 'Nhi khoa', location: [locations[1]._id, locations[2]._id] },
      { name: 'Da liễu', location: [locations[2]._id] }
    ]);
    console.log('>>> Seeded Specialties');

    // Seed Doctors
    const doctorsData = [
      {
        fullName: 'Bác sĩ Nguyễn Văn A',
        email: 'bsa@example.com',
        password: '123456',
        phone: '0901111111',
        role: 'doctor',
        specialty: specialties[0]._id, // Nội khoa
        location: locations[0]._id
      },
      {
        fullName: 'Bác sĩ Trần Thị B',
        email: 'bstb@example.com',
        password: '123456',
        phone: '0902222222',
        role: 'doctor',
        specialty: specialties[2]._id, // Nhi khoa
        location: locations[1]._id
      }
    ];

    const doctors = [];
    for (const doc of doctorsData) {
      const user = new User({
        fullName: doc.fullName,
        email: doc.email,
        password: doc.password,
        phone: doc.phone,
        role: doc.role
      });
      await user.save();

      const doctor = new Doctor({
        user: user._id,
        fullName: doc.fullName,
        specialty: doc.specialty,
        location: doc.location
      });
      await doctor.save();
      doctors.push(doctor);
    }
    console.log('>>> Seeded Doctors & Users');

    // Seed bệnh nhân
    const patientUser = new User({
      fullName: 'Bệnh nhân Demo',
      email: 'patient@example.com',
      password: '123456',
      phone: '0903333333',
      role: 'patient'
    });
    await patientUser.save();

    // Seed Appointment demo
    await Appointment.create({
      patient: patientUser._id,
      doctor: doctors[0]._id,
      date: new Date(),
      time: '09:00',
      status: 'scheduled'
    });
    console.log('>>> Seeded Appointment');

    console.log('>>> Seed demo data thành công');
    process.exit(0);
  } catch (err) {
    console.error('>.< Seed thất bại:', err);
    process.exit(1);
  }
}

seedDemoData();
