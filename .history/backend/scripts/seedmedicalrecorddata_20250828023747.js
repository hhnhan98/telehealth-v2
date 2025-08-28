const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

dotenv.config();

async function seedMultipleMedicalRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // XÓA TOÀN BỘ MEDICAL RECORD CŨ
    await MedicalRecord.deleteMany({});
    console.log('🗑️ Đã xóa toàn bộ MedicalRecords cũ');

    // Lấy 1 bác sĩ và 1 bệnh nhân có sẵn
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });

    if (!doctor || !patient) {
      throw new Error('⚠️ Không tìm thấy doctor hoặc patient trong DB. Hãy seed trước.');
    }

    // Lấy danh sách appointments giữa doctor và patient
    const appointments = await Appointment.find({
      doctor: doctor._id,
      patient: patient._id,
    }).limit(5); // seed tối đa 5 cái

    if (!appointments.length) {
      throw new Error('⚠️ Không tìm thấy appointment nào giữa doctor và patient.');
    }

    for (let i = 0; i < appointments.length; i++) {
      const appt = appointments[i];

      const record = new MedicalRecord({
        appointment: appt._id,
        doctor: doctor._id,
        patient: patient._id,
        date: appt.date || new Date(),
        height: 165 + Math.floor(Math.random() * 10), // random 165-175 cm
        weight: 55 + Math.floor(Math.random() * 15), // random 55-70 kg
        bp: `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)}`,
        pulse: 65 + Math.floor(Math.random() * 15),
        bmi: 20 + Math.random() * 5,
        symptoms: ['Ho', 'Đau đầu', 'Sốt nhẹ', 'Mệt mỏi'][Math.floor(Math.random() * 4)],
        diagnosis: ['Cảm cúm', 'Viêm họng', 'Đau dạ dày', 'Huyết áp cao'][Math.floor(Math.random() * 4)],
        notes: 'Theo dõi tình trạng bệnh nhân.',
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
        conclusion: 'Hẹn tái khám sau 1 tuần',
        careAdvice: 'Nghỉ ngơi, uống nhiều nước, tránh thức khuya',
      });

      await record.save();
      console.log(`✅ MedicalRecord mới tạo cho appointment ${appt._id}`);
    }

    console.log('🎉 Seed xong nhiều MedicalRecords!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed MedicalRecords:', err.message);
    process.exit(1);
  }
}

seedMultipleMedicalRecords();
