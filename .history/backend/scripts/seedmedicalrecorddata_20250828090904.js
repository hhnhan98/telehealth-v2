const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

dotenv.config();

async function seedMedicalRecordsFull() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // XÓA dữ liệu cũ
    await MedicalRecord.deleteMany({});
    await Appointment.deleteMany({});
    console.log('🗑️ Đã xóa toàn bộ MedicalRecords & Appointments cũ');

    // Lấy doctor + patient từ DB
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });

    if (!doctor || !patient) {
      throw new Error('⚠️ Không tìm thấy doctor hoặc patient. Hãy seed User trước.');
    }

    // Tạo danh sách Appointments mới
    const now = new Date();
    const appointments = [];
    for (let i = 0; i < 5; i++) {
      const appt = new Appointment({
        doctor: doctor._id,
        patient: patient._id,
        date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000), // hôm nay + i ngày
        status: 'completed',
        reason: 'Khám sức khỏe tổng quát',
      });
      await appt.save();
      appointments.push(appt);
      console.log(`📅 Tạo Appointment ${i + 1}: ${appt._id}`);
    }

    // Tạo MedicalRecords cho từng Appointment
    for (let appt of appointments) {
      const record = new MedicalRecord({
        appointment: appt._id,
        doctor: doctor._id,
        patient: patient._id,
        date: appt.date,
        height: 160 + Math.floor(Math.random() * 15),
        weight: 50 + Math.floor(Math.random() * 20),
        bp: `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)}`,
        pulse: 60 + Math.floor(Math.random() * 20),
        bmi: 20 + Math.random() * 5,
        symptoms: ['Sốt nhẹ', 'Ho', 'Đau đầu', 'Mệt mỏi'][Math.floor(Math.random() * 4)],
        diagnosis: ['Viêm họng', 'Cảm cúm', 'Dạ dày', 'Huyết áp cao'][Math.floor(Math.random() * 4)],
        notes: 'Theo dõi thêm, tái khám khi cần.',
        prescriptions: [
          {
            name: 'Paracetamol 500mg',
            dose: '1 viên x 2 lần/ngày',
            quantity: 10,
            note: 'Uống sau ăn',
          },
          {
            name: 'Vitamin C',
            dose: '1 viên/ngày',
            quantity: 7,
            note: 'Sáng sau ăn',
          },
        ],
        conclusion: 'Hẹn tái khám sau 7 ngày',
        careAdvice: 'Nghỉ ngơi, uống đủ nước, hạn chế làm việc nặng',
      });

      await record.save();
      console.log(`✅ Tạo MedicalRecord cho Appointment ${appt._id}`);
    }

    console.log('🎉 Seed MedicalRecords hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi seed MedicalRecords:', err.message);
    process.exit(1);
  }
}

seedMedicalRecordsFull();
