const mongoose = require('mongoose');
require('dotenv').config();

const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Đang kiểm tra specialty treo...');
    
    // Lấy tất cả _id của locations còn tồn tại
    const locations = await Location.find({}, '_id');
    const locationIds = locations.map(l => l._id.toString());

    // Xóa specialty mà location không tồn tại
    const result = await Specialty.deleteMany({
      location: { $nin: locationIds }
    });

    console.log(`Đã xóa ${result.deletedCount} specialty treo.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
