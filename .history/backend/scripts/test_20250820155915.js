const bcrypt = require('bcrypt');

async function test() {
  const hash = '$2b$10$MjLfAWoQnjG/Ftk1m3eG1.OhSJ9VN3HqtmwVdoKbBU/9VySZaJAJ.'; // password 123456
  const password = '123456';
  const match = await bcrypt.compare(password, hash);
  console.log('Password match?', match);
}

test();
