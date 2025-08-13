const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('../models/Location');

const locations = [
  {
    name: 'HHN Binh Thanh Hospital',
    address: '475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM'
  },
  {
    name: 'Vinmec Ha Long Hospital',
    address: '10 Đường 25/4, Bạch Đằng, TP. Hạ Long, Quảng Ninh'
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
