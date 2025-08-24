// scripts/fixUserPhone.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find();
    for (const user of users) {
      const phone = user.phone?.trim() || '';
      // Chỉ giữ chuỗi rỗng hoặc 10 số
      if (!/^$|^[0-9]{10}$/.test(phone)) {
        user.phone = ''; // hoặc set một số mặc định hợp lệ, ví dụ '0000000000'
        await user.save();
        console.log(`✅ Fixed User ${user._id} phone`);
      } else {
        console.log(`✅ User ${user._id} phone OK`);
      }
    }
    mongoose.connection.close();
    console.log('🎯 All user phones fixed');
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
