require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/location.model');

const locations = [
  { name: 'HHN Sài Gòn Campus', address: '475A Điện Biên Phủ, Phường Thạnh Mỹ Tây, Quận Bình Thạnh', phone: '8888 8888' },
  { name: 'HHN Ung Văn Khiêm', address: '31/36 Ung Văn Khiêm, Phường Thạnh Mỹ Tây, Quận Bình Thạnh', phone: '8888 8888' }
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
