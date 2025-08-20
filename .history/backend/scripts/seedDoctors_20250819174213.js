const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const bcrypt = require('bcrypt');

const seedDoctors = async () => {
  const locations = await Location.find();
  const specialties = await Specialty.find();

  for (const loc of locations) {
    for (const spec of specialties) {
      // Tạo User bác sĩ
      const passwordHash = await bcrypt.hash('123456', 10);
      const user = await User.create({
        fullName: `Bác sĩ ${spec.name} - ${loc.name}`,
        email: `doctor_${spec._id}_${loc._id}@example.com`,
        password: passwordHash,
        role: 'doctor',
      });

      // Tạo Doctor
      await Doctor.create({
        user: user._id,   // liên kết User
        specialty: spec._id,
        location: loc._id,
        phone: '0901234567', // hợp lệ theo regex model
      });
    }
  }

  console.log('Seed bác sĩ thành công');
};
