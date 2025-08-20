const bcrypt = require('bcryptjs');
const User = require('./models/User');
const mongoose = require('mongoose');
require('dotenv').config();

async function testPw() {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email: 'patient1@demo.com' });
  if (!user) return console.log('User not found');

  const isMatch = await bcrypt.compare('123456', user.password);
  console.log(isMatch); // true nếu đúng
  mongoose.disconnect();
}

testPw();
