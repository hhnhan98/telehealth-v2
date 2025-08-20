require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // đường dẫn đến model User

const locationId = '68a34f7a49463b38f8b5d5ac';   // Thay bằng ID cơ sở bạn muốn test
const specialtyId = '68a34f7a49463b38f8b5d5b0'; // Thay bằng ID chuyên khoa bạn muốn test

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('>>> Kết nối MongoDB thành công');

    const doctors = await User.find({
      role: 'doctor',
      location: locationId,
      specialty: specialtyId
    });

    console.log(`>>> Tìm thấy ${doctors.length} bác sĩ`);
    doctors.forEach(doc => {
      console.log(`- ${doc.name} (${doc._id})`);
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('*** Lỗi kết nối MongoDB:', err.message);
  });
