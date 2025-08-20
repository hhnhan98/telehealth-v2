const bcrypt = require('bcrypt');

const hashed = '$2b$10$9GwPBf45uvvwiSg2AVnmBOa4EahoTELyhOd3cV07TzbU2OqQDMh5.';
const plain = '123456';

bcrypt.compare(plain, hashed).then(console.log); // true nếu đúng
