require('dotenv').config();
const mongoose = require('mongoose');
const Specialty = require('../models/Specialty');

const specialties = [
  { name: 'Tim mạch' },
  { name: 'Nội tiết' },
  { name: 'Thần kinh' },
  { name: 'Hô hấp' },
  { name: 'Da liễu' },
];

const seedSpecialties = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Đã kết nối MongoDB');

    for (const sp of specialties) {
      const exists = await Specialty.findOne({ name: sp.name });
      if (!exists) {
        await Specialty.create(sp);
        console.log(`Đã thêm chuyên ngành: ${sp.name}`);
      } else {
        console.log(`Chuyên ngành đã tồn tại: ${sp.name}`);
      }
    }

    console.log('Khởi tạo chuyên ngành hoàn tất');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
};

seedSpecialties();