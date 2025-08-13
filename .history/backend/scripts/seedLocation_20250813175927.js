const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('../models/Location');

const locations = [
  {
    name: 'HHN Bình Thạnh Hospital (Main ',
    address: '475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM'
  },
  {
    name: 'HHN Ung Văn Khiêm Hospital',
    address: '31/36 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP.HCM'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Location.deleteMany({});
    await Location.insertMany(locations);

    console.log('>>> Seed dữ liệu Location thành công!');
    process.exit();
  } catch (err) {
    console.error('*** Lỗi khi seed Location:', err);
    process.exit(1);
  }
};

seed();
