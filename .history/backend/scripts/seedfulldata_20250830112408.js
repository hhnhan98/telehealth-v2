// scripts/seedFullData.js
const mongoose = require('mongoose');
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

mongoose.connect(MONGO_URI)
  .then(() => console.log('>>> MongoDB connected'))
  .catch(err => {
    console.error('>>> MongoDB connection error:', err);
    process.exit(1);
  });

// Hàm lấy 7 ngày liên tiếp
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
    console.log('>>> Clearing old data...');
    await Appointment.deleteMany({});
    await Schedule.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
    await Location.deleteMany({});
    await Specialty.deleteMany({});

    // ----------- Locations -----------
    const locationsData = [
      { name: 'Bệnh viện A', address: '123 Đường A' },
      { name: 'Bệnh viện B', address: '456 Đường B' },
      { name: 'Bệnh viện C', address: '789 Đường C' }
    ];
    const locations = await Location.insertMany(locationsData);
    console.log(`>>> ${locations.length} Locations created`);

    // ----------- Specialties (5 chuyên khoa mỗi location) -----------
    const specialtyNames = ['Nội', 'Ngoại', 'Răng', 'Mắt', 'Tai Mũi Họng'];
    const specialties = [];
    for (const loc of locations) {
      for (const name of specialtyNames) {
        specialties.push({ name, location: loc._id });
      }
    }
    const createdSpecialties = await Specialty.insertMany(specialties);
    console.log(`>>> ${createdSpecialties.length} specialties created`);

    // ----------- Doctor Users (10) -----------
    const doctorUsers = [];
    for (let i = 0; i < 10; i++) {
      const randomSpecialty = createdSpecialties[Math.floor(Math.random() * createdSpecialties.length)];
      const locId = randomSpecialty.location;
      const email = `doctor${i + 1}@demo.com`;

      let existingUser = await User.findOne({ email });
      if (!existingUser) {
        const user = await User.create({
          fullName: `Doctor ${i + 1}`,
          email,
          password: '123456', // hook sẽ hash
          role: 'doctor',
          specialty: randomSpecialty._id,
          location: locId
        });
        doctorUsers.push(user);
      } else {
        doctorUsers.push(existingUser);
      }
    }
    console.log(`>>> ${doctorUsers.length} doctor users created`);

    // Lấy tất cả Doctor documents (hook tự tạo)
    const doctorDocs = await Doctor.find({});
    if (doctorDocs.length === 0) throw new Error('No Doctor documents found after creating users');

    // ----------- Patient Users (20) -----------
    const patientDocs = [];
    for (let i = 1; i <= 20; i++) {
      const email = `patient${i}@demo.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          fullName: `Patient ${i}`,
          email,
          password: '123456',
          role: 'patient'
        });
      }

      let patient = await Patient.findOne({ user: user._id });
      if (!patient) {
        patient = await Patient.create({
          user: user._id,
          address: `${i} Phố Demo, TP.HCM`,
          bio: '',
          medicalHistory: ''
        });
      }
      patientDocs.push(patient);
    }
    console.log(`👨‍👩‍👧 ${patientDocs.length} Patients created`);

    // ----------- Schedules -----------
    const scheduleDocs = [];
    for (const doctor of doctorDocs) {
      const dates = getNextDates(7);
      for (const date of dates) {
        const dayOfWeek = dayjs(date).day(); // 0 = CN
        let slots = [];

        if (dayOfWeek !== 0) { // CN nghỉ
          for (let h = 8; h < 11; h++) {
            slots.push({ time: `${h.toString().padStart(2,'0')}:00` });
            slots.push({ time: `${h.toString().padStart(2,'0')}:30` });
          }
          for (let h = 13; h < 17; h++) {
            slots.push({ time: `${h.toString().padStart(2,'0')}:00` });
            slots.push({ time: `${h.toString().padStart(2,'0')}:30` });
          }
        }

        const schedule = await Schedule.create({
          doctorId: doctor._id,
          date,
          slots
        });
        scheduleDocs.push(schedule);
      }
    }
    console.log(`>>> ${scheduleDocs.length} Schedules created`);

    // ----------- Appointments 50 random -----------
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];
    const appointmentDocs = [];

    for (let i = 0; i < 50; i++) {
      const patient = patientDocs[Math.floor(Math.random() * patientDocs.length)];
      const doctor = doctorDocs[Math.floor(Math.random() * doctorDocs.length)];

      const doctorSchedules = scheduleDocs.filter(s => s.doctorId.equals(doctor._id) && s.slots.some(slot => !slot.isBooked));
      if (doctorSchedules.length === 0) continue;

      const schedule = doctorSchedules[Math.floor(Math.random() * doctorSchedules.length)];
      const freeSlots = schedule.slots.filter(s => !s.isBooked);
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
        isVerified: Math.random() < 0.8,
        workScheduleId: schedule._id
      });
      appointmentDocs.push(appointment);
    }
    console.log(`📋 ${appointmentDocs.length} Appointments created`);

    // ----------- Optional: MedicalRecords for completed appointments -----------
    const completedAppointments = appointmentDocs.filter(a => a.status === 'completed');
    for (const appt of completedAppointments) {
      const doctorData = await Doctor.findById(appt.doctor).populate('user');
      const patientData = await Patient.findById(appt.patient).populate('user');
      const specialtyData = await Specialty.findById(appt.specialty);
      const locationData = await Location.findById(appt.location);

      await MedicalRecord.create({
        appointment: appt._id,
        doctor: appt.doctor,
        patient: appt.patient,
        doctorSnapshot: {
          fullName: doctorData.user.fullName,
          specialty: specialtyData._id.toString(),
          specialtyName: specialtyData.name,
          location: locationData._id.toString(),
          locationName: locationData.name
        },
        patientSnapshot: {
          fullName: patientData.user.fullName,
          birthYear: patientData.user.birthYear,
          address: patientData.address,
          phone: patientData.user.phone
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
    console.log(`>>> ${completedAppointments.length} MedicalRecords created`);

    console.log('>>> Seed data completed!');
    process.exit(0);

  } catch (err) {
    console.error('>>> Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
