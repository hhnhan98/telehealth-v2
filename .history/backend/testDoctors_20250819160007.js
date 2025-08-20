require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor'); // Đường dẫn đúng tới model Doctor

const locationId = '68a34f7a49463b38f8b5d5ac';   // ID cơ sở muốn test
const specialtyId = '68a34f7a49463b38f8b5d5b0'; // ID chuyên khoa muốn test

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('>>> Kết nối MongoDB thành công');

    // Convert string sang ObjectId
const filter = {
  location: new mongoose.Types.ObjectId(locationId),
  specialty: new mongoose.Types.ObjectId(specialtyId)
};

    const doctors = await Doctor.find(filter, '_id fullName');

    console.log(`>>> Tìm thấy ${doctors.length} bác sĩ`);
    doctors.forEach(doc => {
      console.log(`- ${doc.fullName} (${doc._id})`);
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('*** Lỗi kết nối MongoDB:', err.message);
  });
