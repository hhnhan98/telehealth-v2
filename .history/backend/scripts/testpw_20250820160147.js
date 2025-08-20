const bcrypt = require('bcrypt');
const User = require('../../');

async function testpw() {
  const user = await User.findOne({ email: 'patient1@demo.com' });
  const password = '123456';
  const match = await user.comparePassword(password);
  console.log('Password match?', match);
}

testpw();
