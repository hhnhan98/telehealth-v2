// seed/seedBookingData.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import các model
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');

if (!process.env.MONGODB_URI) {
  console.error('*** Thiếu MONGODB_URI trong file .env');
  process.exit(1);
}

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('>>> Kết nối MongoDB thành công'))
  .catch(err => console.error('*** Lỗi kết nối MongoDB:', err.message));

const seedData = async () => {
  try {
    // Xóa dữ liệu cũ
    await Location.deleteMany({});
    await Specialty.deleteMany({});
    await Doctor.deleteMany({});

    // Tạo locations
    const locations = await Location.insertMany([
      { name: 'Bệnh viện Vinmec Times City' },
      { name: 'Bệnh viện Vinmec Central Park' },
      { name: 'Phòng khám Đa khoa ABC' },
    ]);

    // Tạo specialties kèm location
    const specialties = await Specialty.insertMany([
    { name: 'Nhi khoa', location: locations[0]._id },
    { name: 'Tim mạch', location: locations[0]._id },
    { name: 'Ngoại tổng quát', location: locations[1]._id },
    { name: 'Da liễu', location: locations[2]._id },
    ]);


    // Tạo doctors, random liên kết location + specialty
const doctors = [
  { fullName: 'BS. Nguyễn Văn A', location: locations[0]._id, specialties: [specialties[0]._id] },
  { fullName: 'BS. Trần Thị B', location: locations[0]._id, specialties: [specialties[1]._id] },
  { fullName: 'BS. Lê Văn C', location: locations[1]._id, specialties: [specialties[2]._id] },
  { fullName: 'BS. Phạm Thị D', location: locations[2]._id, specialties: [specialties[3]._id] },
  { fullName: 'BS. Hoàng Văn E', location: locations[1]._id, specialties: [specialties[1]._id] },
];

    await Doctor.insertMany(doctors);

    console.log('>>> Seed dữ liệu thành công');
    process.exit(0);
  } catch (err) {
    console.error('*** Lỗi seed dữ liệu:', err);
    process.exit(1);
  }
};

seedData();
