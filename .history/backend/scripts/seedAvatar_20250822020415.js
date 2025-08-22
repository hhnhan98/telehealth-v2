const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');

// Import model
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/telehealth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const DEFAULT_AVATAR = '/uploads/default-avatar.png';

async function seedAvatars() {
  try {
    const doctors = await Doctor.find().populate('user');
    for (const doctor of doctors) {
      if (!doctor.user.avatar) {
        await User.findByIdAndUpdate(doctor.user._id, { avatar: DEFAULT_AVATAR });
        console.log(`✅ Updated avatar for ${doctor.user.fullName}`);
      }
    }
    console.log('🎉 All missing avatars fixed!');
  } catch (err) {
    console.error('❌ Error fixing avatars:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedAvatars();
