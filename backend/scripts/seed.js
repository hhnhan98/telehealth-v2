const mongoose = require('mongoose');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');

// Kết nối MongoDB (sửa lại URI đúng nếu cần)
mongoose.connect('mongodb+srv://teleadmin:3O21nHsixNkti6yY@cluster0.erwicee.mongodb.net/telehealth?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));

async function seed() {
  // Xoá sạch trước khi seed
  await Specialty.deleteMany({});
  await Doctor.deleteMany({});

  // Tạo chuyên khoa
  const specialties = await Specialty.insertMany([
    { name: 'Nội tổng quát' },
    { name: 'Da liễu' },
    { name: 'Nhi khoa' },
  ]);

  // Tạo bác sĩ gắn với chuyên khoa
  await Doctor.insertMany([
    { fullName: 'Bác sĩ A', email: 'a@example.com', specialty: specialties[0]._id },
    { fullName: 'Bác sĩ B', email: 'b@example.com', specialty: specialties[1]._id },
    { fullName: 'Bác sĩ C', email: 'c@example.com', specialty: specialties[2]._id },
  ]);

  console.log('Đã seed xong');
  process.exit();
}

seed();
