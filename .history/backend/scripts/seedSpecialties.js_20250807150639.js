const mongoose = require('mongoose');
const Specialty = require('../models/Specialty');
require('dotenv').config(); // để lấy MONGODB_URI

const specialties = [
  { name: 'Chuyên khoa A' },
  { name: 'Khoa B' },
  { name: 'Tim mạch' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Specialty.deleteMany(); // xóa dữ liệu cũ nếu có
    await Specialty.insertMany(specialties);
    console.log('Seed chuyên khoa thành công!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Seed thất bại:', err);
    mongoose.disconnect();
  }
}

seed();
