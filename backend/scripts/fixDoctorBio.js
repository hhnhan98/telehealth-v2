// scripts/fixDoctorBio.js
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const doctors = await Doctor.find();
    for (const doc of doctors) {
      if (!doc.bio) {
        doc.bio = '';
        await doc.save();
        console.log(`✅ Fixed Doctor ${doc._id} bio`);
      } else {
        console.log(`✅ Doctor ${doc._id} bio OK`);
      }
    }
    mongoose.connection.close();
    console.log('🎯 All doctor bios fixed');
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();
