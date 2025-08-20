// scripts/clearUsers.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User'); // đường dẫn tới file User.js của bạn

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telehealth';

const clearUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const result = await User.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} users`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing users:', err);
    process.exit(1);
  }
};

clearUsers();
