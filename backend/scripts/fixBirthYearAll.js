// scripts/fixBirthYear.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function fixBirthYears() {
  try {
    const users = await User.find({});
    for (const user of users) {
      if (user.birthYear === undefined || isNaN(user.birthYear)) {
        const oldValue = user.birthYear;
        user.birthYear = null;
        await user.save();
        console.log(`✅ Fixed birthYear for ${user.fullName} (was: ${oldValue})`);
      }
    }
    console.log('🎯 All user birthYear fields checked and fixed!');
  } catch (err) {
    console.error('❌ Error fixing birthYear:', err);
  } finally {
    mongoose.disconnect();
  }
}

fixBirthYears();
