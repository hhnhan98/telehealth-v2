const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');

async function seedDemoData() {
  await mongoose.connect(process.env.MONGODB_URI);

  // 0. Xóa dữ liệu cũ
  await User.deleteMany({ role: 'doctor' }); // chỉ xóa bác sĩ để giữ admin/patient
  await Location.deleteMany({});
  await Specialty.deleteMany({});

  // 1. Specialties
  const specialties = ['Tim mạch', 'Da liễu', 'Nhi khoa', 'Răng hàm mặt', 'Thần kinh'];
  const savedSpecialties = await Specialty.insertMany(
    specialties.map(name => ({ name, description: `${name} - Mô tả demo` }))
  );

  // 2. Locations (mỗi cơ sở có 1-3 chuyên khoa ngẫu nhiên)
  const locations = ['Cơ sở A', 'Cơ sở B', 'Cơ sở C'];
  const savedLocations = [];

  for (const name of locations) {
    const locSpecialties = savedSpecialties
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map(s => s._id);

    const loc = new Location({ name, address: `${name} - Địa chỉ demo`, specialties: locSpecialties });
    await loc.save();
    savedLocations.push(loc);
  }

  // 3. Bác sĩ
  const doctorsData = [
    { fullName: 'Bác sĩ A', email: 'doc1@demo.com', phone: '09000001' },
    { fullName: 'Bác sĩ B', email: 'doc2@demo.com', phone: '09000002' },
    { fullName: 'Bác sĩ C', email: 'doc3@demo.com', phone: '09000003' },
  ];

  for (const doc of doctorsData) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const location = savedLocations[Math.floor(Math.random() * savedLocations.length)];
    const specialtyId = location.specialties[Math.floor(Math.random() * location.specialties.length)];

    const user = new User({
      ...doc,
      password: hashedPassword,
      role: 'doctor',
      location: location._id,
      specialty: specialtyId,
    });

    await user.save();
  }

  console.log('Seed demo data thành công!');
  mongoose.disconnect();
}

seedDemoData().catch(console.error);
