const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGOd_URI);
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const admin = new User({
    fullName: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  await admin.save();
  console.log('Admin account created');
  mongoose.disconnect();
}

seedAdmin().catch(console.error);
