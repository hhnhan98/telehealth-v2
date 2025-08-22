// checkAvatars.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Thay bằng URI MongoDB của bạn
const MONGO_URI = 'mongodb://localhost:27017/telehealth';

// Import model User hoặc Doctor
const Doctor = require('./models/Doctor'); // đường dẫn đúng tới model Doctor

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error', err));

async function checkAvatars() {
  try {
    const doctors = await Doctor.find().populate('user');
    console.log(`🔹 Tổng số bác sĩ: ${doctors.length}`);

    for (const doc of doctors) {
      const avatarPath = doc.user?.avatar;
      if (!avatarPath) {
        console.log(`❗ ${doc.user?.fullName || doc._id}: không có avatar`);
        continue;
      }

      // loại bỏ / đầu tiên nếu có
      const relativePath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
      const fullPath = path.join(__dirname, relativePath);

      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${doc.user.fullName}: avatar tồn tại`);
      } else {
        console.log(`❌ ${doc.user.fullName}: avatar KHÔNG TỒN TẠI -> ${fullPath}`);
      }
    }
  } catch (err) {
    console.error('Error checking avatars:', err);
  } finally {
    mongoose.disconnect();
  }
}

checkAvatars();
