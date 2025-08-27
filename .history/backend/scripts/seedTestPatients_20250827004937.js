const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('..Appointment./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');

const MONGO_URI = 'mongodb://127.0.0.1:27017/telehealth'; // thay theo database của bạn

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    // 1. Tạo bác sĩ test
    let doctor = await User.findOne({ email: 'doctor1@example.com' });
    if (!doctor) {
      doctor = await User.create({
        fullName: 'Dr Test',
        email: 'doctor1@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'doctor',
      });
    }

    // 2. Tạo bệnh nhân test
    let userPatient = await User.findOne({ email: 'patient1@example.com' });
    if (!userPatient) {
      userPatient = await User.create({
        fullName: 'Patient One',
        email: 'patient1@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'patient',
      });
    }

    let patient = await Patient.findOne({ user: userPatient._id });
    if (!patient) {
      patient = await Patient.create({
        user: userPatient._id,
        address: '123 Test Street',
        bio: 'Test patient',
        medicalHistory: 'Không có',
      });
    }

    // 3. Tạo appointment completed
    let appointment = await Appointment.findOne({ doctor: doctor._id, patient: patient._id });
    if (!appointment) {
      appointment = await Appointment.create({
        doctor: doctor._id,
        patient: patient._id,
        date: new Date(),
        time: '10:00',
        status: 'completed',
        specialty: null,
        location: null,
      });
    } else {
      appointment.status = 'completed';
      await appointment.save();
    }

    // 4. Tạo medical record liên kết
    let record = await MedicalRecord.findOne({ appointment: appointment._id });
    if (!record) {
      record = await MedicalRecord.create({
        patient: patient._id,
        doctor: doctor._id,
        appointment: appointment._id,
        date: new Date(),
        symptoms: 'Đau đầu, sốt nhẹ',
        diagnosis: 'Cảm cúm nhẹ',
        height: 170,
        weight: 65,
        bp: '120/80',
        pulse: 80,
        bmi: 22.5,
        notes: 'Nghỉ ngơi, uống nhiều nước',
        prescriptions: [
          { name: 'Paracetamol', dose: '500mg', quantity: 10, note: '2 lần/ngày' },
        ],
        conclusion: 'Khỏe hơn sau 3 ngày',
        careAdvice: 'Uống nước, nghỉ ngơi',
      });
    }

    console.log('✅ Seed test data hoàn tất');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
