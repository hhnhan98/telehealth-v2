const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find();
    for (const u of users) {
      const phone = u.phone?.trim() || '';
      if (!/^$|^[0-9]{10}$/.test(phone)) {
        u.phone = ''; // hoặc '0000000000' nếu muốn mặc định hợp lệ
        await u.save();
        console.log(`✅ Fixed User ${u._id} phone`);
      }
    }
    console.log('🎯 All User phones fixed');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
