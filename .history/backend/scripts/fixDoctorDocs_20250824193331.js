// scripts/fixDoctorDocs.js
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const doctors = await Doctor.find();
  for (const doc of doctors) {
    let updated = false;
    if (!doc.phone) { doc.phone = ''; updated = true; }
    if (!doc.bio) { doc.bio = ''; updated = true; }
    if (updated) {
      await doc.save();
      console.log(`✅ Fixed Doctor ${doc._id}: added missing fields`);
    } else {
      console.log(`✅ Doctor ${doc._id} OK`);
    }
  }
  mongoose.connection.close();
})();
