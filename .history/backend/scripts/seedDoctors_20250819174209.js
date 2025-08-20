const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Lấy tất cả cơ sở và chuyên khoa
    const locations = await Location.find();
    const specialties = await Specialty.find();

    if (!locations.length || !specialties.length) {
      console.log('Chưa có location hoặc specialty, seed trước!');
      process.exit(0);
    }

    // Xóa toàn bộ bác sĩ cũ (tuỳ chọn)
    await Doctor.deleteMany({});

    const doctors = [];

    // Tạo 3 bác sĩ mỗi location + specialty
    locations.forEach(loc => {
      specialties.forEach(spec => {
        for (let i = 1; i <= 3; i++) {
          doctors.push({
            fullName: `Bác sĩ ${i} - ${spec.name} - ${loc.name}`,
            email: `doctor${i}_${spec._id}_${loc._id}@example.com`,
            specialty: spec._id,
            location: loc._id,
            phone: `0900000${i}`,
            password: '123456', // hash nếu model bắt buộc
          });
        }
      });
    });

    await Doctor.insertMany(doctors);
    console.log(`Seed thành công ${doctors.length} bác sĩ`);
    process.exit(0);
  } catch (err) {
    console.error('Seed doctors thất bại:', err);
    process.exit(1);
  }
};

seedDoctors();
