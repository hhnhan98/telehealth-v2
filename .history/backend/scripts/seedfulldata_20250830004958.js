// scripts/seedFullDataBulk.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const dotenv = require('dotenv');
dotenv.config();

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
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const getNextDates = (numDays) => {
  const dates = [];
  const today = dayjs();
  for (let i = 0; i < numDays; i++) {
    dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

const seedBulkData = async () => {
  try {
    console.log('🗑️ Clearing old data...');
    await Promise.all([
      Appointment.deleteMany({}),
      Schedule.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      User.deleteMany({}),
      Location.deleteMany({}),
      Specialty.deleteMany({})
    ]);

    // -------- Locations --------
    const locations = await Location.insertMany([
      { name: 'Bệnh viện A', address: '123 Đường A' },
      { name: 'Bệnh viện B', address: '456 Đường B' },
      { name: 'Bệnh viện C', address: '789 Đường C' }
    ]);

    // -------- Specialties --------
    const specialtyNames = ['Nội', 'Ngoại', 'Răng', 'Mắt', 'Tai Mũi Họng'];
    const specialties = [];
    for (const loc of locations) {
      for (const name of specialtyNames) {
        specialties.push({ name, location: loc._id });
      }
    }
    const createdSpecialties = await Specialty.insertMany(specialties);

    // -------- Users: Doctors --------
    const doctorUsersData = [];
    for (let i = 0; i < 10; i++) {
      const randomSpecialty = createdSpecialties[Math.floor(Math.random() * createdSpecialties.length)];
      doctorUsersData.push({
        fullName: `Doctor ${i + 1}`,
        email: `doctor${i + 1}@demo.com`,
        password: '123456',
        role: 'doctor',
        specialty: randomSpecialty._id,
        location: randomSpecialty.location
      });
    }
    const doctorUsers = await User.insertMany(doctorUsersData);
    const doctorDocs = await Doctor.find().populate('user').populate('specialty').populate('location');

    // -------- Users: Patients --------
    const patientUsersData = [];
    for (let i = 1; i <= 20; i++) {
      patientUsersData.push({
        fullName: `Patient ${i}`,
        email: `patient${i}@demo.com`,
        password: '123456',
        role: 'patient'
      });
    }
    const patientUsers = await User.insertMany(patientUsersData);
    const patientDocs = await Patient.find().populate('user');

    // -------- Schedules --------
    const scheduleData = [];
    for (const doctor of doctorDocs) {
      const dates = getNextDates(7);
      for (const date of dates) {
        const dayOfWeek = dayjs(date).day();
        if (dayOfWeek === 0) continue; // CN nghỉ
        const slots = [];
        for (let h = 8; h < 11; h++) {
          slots.push({ time: `${h.toString().padStart(2, '0')}:00` });
          slots.push({ time: `${h.toString().padStart(2, '0')}:30` });
        }
        for (let h = 13; h < 17; h++) {
          slots.push({ time: `${h.toString().padStart(2, '0')}:00` });
          slots.push({ time: `${h.toString().padStart(2, '0')}:30` });
        }
        scheduleData.push({ doctorId: doctor._id, date, slots });
      }
    }
    const scheduleDocs = await Schedule.insertMany(scheduleData);

    // -------- Appointments --------
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];
    const appointmentData = [];
    const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

    for (let i = 0; i < 50; i++) {
      const patient = randomElement(patientDocs);
      const doctor = randomElement(doctorDocs);
      const doctorSchedules = scheduleDocs.filter(s => s.doctorId.equals(doctor._id) && s.slots.some(slot => !slot.isBooked));
      if (!doctorSchedules.length) continue;
      const schedule = randomElement(doctorSchedules);
      const freeSlots = schedule.slots.filter(s => !s.isBooked);
      if (!freeSlots.length) continue;

      const slot = randomElement(freeSlots);
      slot.isBooked = true;
      await schedule.save();

      const datetime = dayjs(`${schedule.date}T${slot.time}:00`).toDate();

      appointmentData.push({
        location: doctor.location._id,
        specialty: doctor.specialty._id,
        doctor: doctor._id,
        patient: patient._id,
        datetime,
        date: schedule.date,
        time: slot.time,
        reason: `Khám bệnh test ${i + 1}`,
        status: randomElement(statuses),
        isVerified: Math.random() < 0.8,
        workScheduleId: schedule._id
      });
    }

    const appointmentDocs = await Appointment.insertMany(appointmentData);

    // -------- MedicalRecords for completed appointments --------
    const completedAppointments = appointmentDocs.filter(a => a.status === 'completed');
    const medicalRecordsData = [];
    for (const appt of completedAppointments) {
      const doctorDoc = await Doctor.findById(appt.doctor).populate('user').populate('specialty').populate('location');
      const patientDoc = await Patient.findById(appt.patient).populate('user');

      medicalRecordsData.push({
        appointment: appt._id,
        doctor: appt.doctor,
        patient: appt.patient,
        doctorSnapshot: {
          fullName: doctorDoc.user.fullName,
          specialty: doctorDoc.specialty._id.toString(),
          specialtyName: doctorDoc.specialty.name,
          location: doctorDoc.location._id.toString(),
          locationName: doctorDoc.location.name
        },
        patientSnapshot: {
          fullName: patientDoc.user.fullName,
          birthYear: patientDoc.user.birthYear,
          address: patientDoc.address,
          phone: patientDoc.user.phone
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
        prescriptions: [{ name: 'Paracetamol', dose: '500mg', quantity: 10, note: '2 viên mỗi lần' }],
        conclusion: 'Bình thường',
        careAdvice: 'Uống nhiều nước, nghỉ ngơi'
      });
    }
    await MedicalRecord.insertMany(medicalRecordsData);

    console.log('🎉 Bulk seed completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding bulk data:', err);
    process.exit(1);
  }
};

seedBulkData();
