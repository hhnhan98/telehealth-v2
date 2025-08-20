// const bcrypt = require('bcrypt');

// const hashed = '$2b$10$9GwPBf45uvvwiSg2AVnmBOa4EahoTELyhOd3cV07TzbU2OqQDMh5.';
// const plain = '123456';

// bcrypt.compare(plain, hashed).then(console.log); // true nếu đúng
const bcrypt = require('bcrypt');
const hash = '$2b$10$9GwPBf45uvvwiSg2AVnmBOa4EahoTELyhOd3cV07TzbU2OqQDMh5.'; // password trong DB
bcrypt.compare('123456', hash).then(console.log); // phải trả true
