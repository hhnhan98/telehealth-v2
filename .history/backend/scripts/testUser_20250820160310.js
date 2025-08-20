require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Đường dẫn tới model User

async function main() {
  try {
    // --- Kết nối MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/telehealth';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // --- Xoá user nếu tồn tại
    const email = 'patient1@demo.com';
    await User.deleteOne({ email });
    console.log(`♻️  Old user with email "${email}" removed`);

    // --- Tạo user mới
    const newUser = new User({
      fullName: 'Bệnh nhân 1',
      email,
      password: '123456',
      role: 'patient',
    });

    await newUser.save();
    console.log('✅ New user created:', newUser);

    // --- Test password
    const isMatch = await newUser.comparePassword('123456');
    console.log('Password match?', isMatch);

    // --- Test wrong password
    const isMatchWrong = await newUser.comparePassword('wrongpass');
    console.log('Wrong password match?', isMatchWrong);

    // --- Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.connection.close();
  }
}

main();
