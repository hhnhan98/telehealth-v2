const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

dotenv.config();

async function seedMedicalRecord() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Lấy 1 bác sĩ và 1 bệnh nhân có sẵn
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });

    if (!doctor || !patient) {
      throw new Error('⚠️ Không tìm thấy doctor hoặc patient trong DB. Hãy seed trước.');
    }

    // Lấy appointment giữa doctor và patient
    const appointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patient._id,
    });

    if (!appointment) {
      throw new Error('⚠️ Không tìm thấy appointment cho doctor và patient.');
    }

    // Kiểm tra đã có MedicalRecord cho appointment này chưa
    const existed = await MedicalRecord.findOne({ appointment: appointment._id });
    if (existed) {
      console.log('⚠️ MedicalRecord đã tồn tại cho appointment này');
      process.exit(0);
    }

    // Tạo MedicalRecord mới
    const record = new MedicalRecord({
      appointment: appointment._id,
      doctor: doctor._id,
      patient: patient._id,
      date: new Date(),
      height: 170,
      weight: 65,
      bp: '120/80',
      pulse: 72,
      bmi: 22.5,
      symptoms: 'Đau đầu, chóng mặt',
      diagnosis: 'Thiếu máu não nhẹ',
      notes: 'Khuyên nghỉ ngơi và uống nhiều nước',
      prescriptions: [
        {
          name: 'Paracetamol 500mg',
          dose: '1 viên x 2 lần/ngày',
          quantity: 10,
          note: 'Uống sau ăn',
        },
        {
          name: 'Vitamin B6',
          dose: '1 viên/ngày',
          quantity: 7,
          note: 'Sáng sau ăn',
        },
      ],
      conclusion: 'Ổn định sau 1 tuần',
      careAdvice: 'Tái khám nếu triệu chứng không cải thiện',
    });

    await record.save();
    console.log('✅ MedicalRecord đã được tạo:', record._id);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed MedicalRecord:', err.message);
    process.exit(1);
  }
}

seedMedicalRecord();
