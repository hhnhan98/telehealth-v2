const mongoose = require('mongoose');
require('dotenv').config();
const Location = require('../models/Location');

const locations = [
  {
    name: 'Vinmec Central Park International Hospital',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM'
  },
  {
    name: 'Vinmec Times City International Hospital',
    address: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng, Hà Nội'
  },
  {
    name: 'Vinmec Nha Trang International Hospital',
    address: '42A Trần Phú, Lộc Thọ, TP. Nha Trang'
  },
  {
    name: 'Vinmec Danang International Hospital',
    address: '4 Nguyễn Tri Phương, Thạc Gián, Thanh Khê, Đà Nẵng'
  },
  {
    name: 'Vinmec Ha Long International Hospital',
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

    console.log('✅ Seed dữ liệu Location thành công!');
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi khi seed Location:', err);
    process.exit(1);
  }
};

seed();
