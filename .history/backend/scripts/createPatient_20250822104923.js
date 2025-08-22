require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    const users = await User.find({ role: 'patient' });

    for (const user of users) {
      const exists = await Patient.findOne({ user: user._id });
      if (!exists) {
        await Patient.create({ user: user._id });
        console.log(`✅ Patient document created for ${user.fullName}`);
      } else {
        console.log(`ℹ️ Patient document already exists for ${user.fullName}`);
      }
    }

    console.log('🎉 Done! All patients are synced.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
