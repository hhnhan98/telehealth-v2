require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const locations = await Location.find();
    const specialties = await Specialty.find();

    if (!locations.length || !specialties.length) {
      console.log('>>> Vui lòng seed locations và specialties trước.');
      return;
    }

    const doctorsData = [
      {
        fullName: 'Dr. Nguyễn Văn A',
        location: locations[0]._id,
        specialties: [specialties[0]._id],
        phone: '0912345678',
        email: 'a@example.com'
      },
      {
        fullName: 'Dr. Trần Thị B',
        location: locations[0]._id,
        specialties: [specialties[1]._id],
        phone: '0923456789',
        email: 'b@example.com'
      },
      {
        fullName: 'Dr. Lê Văn C',
        location: locations[1]._id,
        specialties: [specialties[0]._id, specialties[1]._id],
        phone: '0934567890',
        email: 'c@example.com'
      }
    ];

    await Doctor.deleteMany({});
    await Doctor.insertMany(doctorsData);

    console.log('>>> Seed doctors thành công');
    mongoose.connection.close();
  } catch (err) {
    console.error('*** Lỗi seed doctors:', err);
    mongoose.connection.close();
  }
};

seedDoctors();
