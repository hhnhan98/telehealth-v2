// scripts/seedFullData.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const dotenv = require('dotenv');
dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

const { toVN } = require('../utils/timezone');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';
const SALT_ROUNDS = 10;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Chuyển tiếng Việt -> không dấu, chữ thường, bỏ khoảng trắng
const normalizeForEmail = (str) => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '')
  .toLowerCase();

// Sinh datetime random trong khoảng 7 ngày tới, trong giờ hành chính
const generateRandomDateTime = (scheduleSlots) => {
  const futureSlots = scheduleSlots.filter(s => !s.isBooked);
  if (futureSlots.length === 0) return null;

  const slot = futureSlots[Math.floor(Math.random() * futureSlots.length)];
  return slot.time;
};

// Hàm tạo ngày liên tiếp
const getNextDates = (numDays) => {
  const dates = [];
  const today = dayjs();
  for (let i = 0; i < numDays; i++) {
    dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

const seedData = async () => {
  try {
    console.log('🗑️ Clearing old data...');
    await Appointment.deleteMany({});
    await Schedule.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
    await Location.deleteMany({});
    await Specialty.deleteMany({});

    // ----------- Locations (3 cơ sở) -----------
    const locationsData = [
      { name: 'Bệnh viện A', address: '123 Đường A' },
      { name: 'Bệnh viện B', address: '456 Đường B' },
      { name: 'Bệnh viện C', address: '789 Đường C' }
    ];
    const locations = await Location.insertMany(locationsData);
    console.log(`🏥 ${locations.length} Locations created`);

    // ----------- Seed Specialties -----------
    // Mỗi Location có 5 chuyên khoa
    const specialties = [];
    const specialtyNames = ['Nội', 'Ngoại', 'Răng', 'Mắt', 'Tai Mũi Họng'];

    for (const loc of locations) {
    for (const name of specialtyNames) {
        specialties.push({
        name,
        location: loc._id // đảm bảo ObjectId
        });
    }
    }

    // Xóa Specialty cũ trước khi insert
    await Specialty.deleteMany({});
    await Specialty.collection.dropIndexes().catch(err => {
    if (err.codeName !== 'NamespaceNotFound') console.error(err);
    });

    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log(`🩺 ${createdSpecialties.length} specialties created successfully`);


    // ----------- Doctors (10 Users + Doctor) -----------
// Giả sử đã có createdSpecialties (15 chuyên khoa), locations (3 cơ sở)
// Tạo 10 bác sĩ
const doctorUsers = [];
for (let i = 0; i < 10; i++) {
  const randomSpecialty = createdSpecialties[Math.floor(Math.random() * createdSpecialties.length)];
  const locId = randomSpecialty.location; // Lấy location đúng của specialty

  const email = `doctor${i+1}@demo.com`;
  const user = await User.create({
    fullName: `Doctor ${i+1}`,
    email,
    password: '123456',
    role: 'doctor',
    specialty: randomSpecialty._id, // phải gán đúng ObjectId
    location: locId
  });

  const doctor = await Doctor.create({
    user: user._id,
    specialty: randomSpecialty._id,
    location: locId,
    bio: `Bác sĩ chuyên khoa ${randomSpecialty.name}`
  });

  doctorUsers.push(doctor);
}
console.log(`👨‍⚕️ ${doctorUsers.length} doctors created successfully`);


    // ----------- Patients (20 Users + Patient) -----------
    const patientDocs = [];
    for (let i = 1; i <= 20; i++) {
      const email = `patient${i}@demo.com`;
      const user = await User.create({
        fullName: `Patient ${i}`,
        email,
        password: '123456',
        role: 'patient'
      });

      const patient = await Patient.create({
        user: user._id,
        address: `${i} Phố Demo, TP.HCM`,
        bio: '',
        medicalHistory: ''
      });

      patientDocs.push(patient);
    }
    console.log(`👨‍👩‍👧 ${patientDocs.length} Patients created`);

    // ----------- Schedules (7 ngày liên tiếp, slot 30 phút, giờ hành chính) -----------
    const scheduleDocs = [];
    for (const doctor of doctorDocs) {
      const dates = getNextDates(7);
      for (const date of dates) {
        let slots = [];
        const dayOfWeek = dayjs(date).day(); // 0 = CN, 6 = T7

        if (dayOfWeek !== 0) { // CN nghỉ
          // Sáng 08:00 - 11:00
          for (let h = 8; h < 11; h++) {
            slots.push({ time: `${h.toString().padStart(2, '0')}:00` });
            slots.push({ time: `${h.toString().padStart(2, '0')}:30` });
          }
          // Chiều 13:00 - 17:00
          for (let h = 13; h < 17; h++) {
            slots.push({ time: `${h.toString().padStart(2, '0')}:00` });
            slots.push({ time: `${h.toString().padStart(2, '0')}:30` });
          }
        } else { // CN nghỉ
          slots = [];
        }

        const schedule = await Schedule.create({
          doctorId: doctor._id,
          date,
          slots
        });
        scheduleDocs.push(schedule);
      }
    }
    console.log(`📅 ${scheduleDocs.length} Schedules created`);

    // ----------- Appointments (50 appointments random) -----------
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];
    const appointmentDocs = [];

    for (let i = 0; i < 50; i++) {
      const patient = patientDocs[Math.floor(Math.random() * patientDocs.length)];
      const doctor = doctorDocs[Math.floor(Math.random() * doctorDocs.length)];

      // Chọn schedule ngày hợp lệ có slot trống
      const doctorSchedules = scheduleDocs.filter(s => s.doctorId.equals(doctor._id) && s.slots.length > 0);
      if (doctorSchedules.length === 0) continue;

      const schedule = doctorSchedules[Math.floor(Math.random() * doctorSchedules.length)];
      const freeSlots = schedule.slots.filter(s => !s.isBooked);
      if (freeSlots.length === 0) continue;

      const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
      slot.isBooked = true;
      await schedule.save();

      const datetime = dayjs(`${schedule.date}T${slot.time}:00`).toDate();

      const appointment = await Appointment.create({
        location: doctor.location,
        specialty: doctor.specialty,
        doctor: doctor._id,
        patient: patient._id,
        datetime,
        date: schedule.date,
        time: slot.time,
        reason: `Khám bệnh test ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        isVerified: Math.random() < 0.8, // 80% verified
        workScheduleId: schedule._id
      });

      appointmentDocs.push(appointment);
    }

    console.log(`📋 ${appointmentDocs.length} Appointments created`);

    // ----------- Optional: MedicalRecords for completed appointments -----------
    const completedAppointments = appointmentDocs.filter(a => a.status === 'completed');
    for (const appt of completedAppointments) {
      await MedicalRecord.create({
        appointment: appt._id,
        doctor: appt.doctor,
        patient: appt.patient,
        doctorSnapshot: {
          fullName: (await Doctor.findById(appt.doctor).populate('user')).user.fullName,
          specialty: (await Specialty.findById(appt.specialty))._id.toString(),
          specialtyName: (await Specialty.findById(appt.specialty)).name,
          location: (await Location.findById(appt.location))._id.toString(),
          locationName: (await Location.findById(appt.location)).name
        },
        patientSnapshot: {
          fullName: (await Patient.findById(appt.patient).populate('user')).user.fullName,
          birthYear: (await Patient.findById(appt.patient).populate('user')).user.birthYear,
          address: (await Patient.findById(appt.patient)).address,
          phone: (await Patient.findById(appt.patient).populate('user')).user.phone
        },
        date: appt.datetime,
        height: 170,
        weight: 70,
        bp: '120/80',
        pulse: 70,
        bmi: 24.2,
        symptoms: 'Đau đầu, chóng mặt',
        diagnosis: 'Cảm cúm',
        notes: 'Test medical record',
        prescriptions: [
          { name: 'Paracetamol', dose: '500mg', quantity: 10, note: '2 viên mỗi lần' }
        ],
        conclusion: 'Bình thường',
        careAdvice: 'Uống nhiều nước, nghỉ ngơi'
      });
    }
    console.log(`💊 ${completedAppointments.length} MedicalRecords created`);

    console.log('🎉 Seed data completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding data:', err);   
    process.exit(1);
  }
};

seedData();
