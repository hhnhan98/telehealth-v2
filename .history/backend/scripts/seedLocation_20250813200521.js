require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/location.model');

const locations = [
  { name: 'HHN Main Campus', address: '458 Minh Khai, Hà Nội', phone: '8888 8888' },
  { name: 'HHN Ung Văn Khiêm', address: '208 Nguyễn Hữu Cảnh, TP.HCM', phone: '028 3622 1166' }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Kết nối MongoDB thành công!');
    await Location.deleteMany();
    await Location.insertMany(locations);
    console.log('Seed Location thành công!');
    process.exit();
  })
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });
