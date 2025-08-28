const mongoose = require('mongoose');
require('dotenv').config();

const Specialty = require('../models/Specialty');

const migrateSpecialtyLocation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Đã kết nối MongoDB');

    const specialties = await Specialty.find({});

    for (const spec of specialties) {
      if (spec.locations && spec.locations.length > 0) {
        spec.location = spec.locations[0]; // lấy phần tử đầu tiên
        spec.locations = undefined; // xoá mảng cũ
        await spec.save();
        console.log(`Cập nhật Specialty ${spec.name} (${spec._id})`);
      }
    }

    console.log('Migration hoàn tất');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi migrate:', err);
    process.exit(1);
  }
};

migrateSpecialtyLocation();
