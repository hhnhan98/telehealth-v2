// scripts/seedData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Chuyển tiếng Việt có dấu -> không dấu, chữ thường, bỏ khoảng trắng
const normalizeForEmail = (str) => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '')
  .toLowerCase();

const seedData = async () => {
  try {
    // ----------- Xóa dữ liệu cũ và drop index Doctor.user -----------
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Location.deleteMany({});
    await Specialty.deleteMany({});
    await Doctor.collection.dropIndexes().catch(err => {
      if (err.codeName !== 'NamespaceNotFound') console.error(err);
    });

    console.log('🗑️ Old data cleared');

    // ----------- Seed Locations -----------
    const locations = await Location.insertMany([
      { name: 'Bệnh viện A' },
      // { name: 'Bệnh viện B' },
      // { name: 'Trung tâm Y tế C' }
    ]);
    console.log(`🏥 ${locations.length} cơ sở đã seed`);

    // ----------- Seed Specialties -----------
    const specialties = await Specialty.insertMany([
      { name: 'Khoa A', locations: locations.map(l => l._id) },
      // { name: 'Khoa B', locations: locations.map(l => l._id) },
      // { name: 'Khoa C', locations: locations.map(l => l._id) }
    ]);
    console.log(`🩺 ${specialties.length} chuyên khoa đã seed`);

    // // ----------- Seed Doctors (User + Doctor) -----------
    // const doctorDocs = [];
    // for (const spec of specialties) {
    //   for (const loc of locations) {
    //     const email = `${normalizeForEmail(spec.name)}_${normalizeForEmail(loc.name)}@demo.com`;
    //     let user = await User.findOne({ email });
    //     if (!user) {
    //       const hashedPassword = await bcrypt.hash('123456', 10);
    //       user = await User.create({
    //         fullName: `${spec.name} Doctor at ${loc.name}`,
    //         email,
    //         password: hashedPassword,
    //         role: 'doctor',
    //         specialty: spec._id,
    //         location: loc._id
    //       });
    //     }

    //     let doctor = await Doctor.findOne({ user: user._id });
    //     if (!doctor) {
    //       doctor = await Doctor.create({
    //         user: user._id,
    //         specialty: spec._id,
    //         location: loc._id,
    //         bio: ''
    //       });
    //     }

    //     doctorDocs.push(doctor);
    //   }
    // }
    // console.log(`👨‍⚕️ ${doctorDocs.length} doctors seeded successfully`);

    // // ----------- Seed Patients (User + Patient) -----------
    // const patientsData = [
    //   { fullName: 'Nguyen Van A', email: 'patient_a@demo.com', password: '123456', address: '123 Nguyen Van A, Phuong Sai Gon, TPHCM' },
    //   { fullName: 'Tran Thi B', email: 'patient_b@demo.com', password: '123456', address: '456 Tran Thi B, Phuong Sai Gon, TPHCM' },
    //   { fullName: 'Le Van C', email: 'patient_c@demo.com', password: '123456', address: '789 Le Van C, Phuong Sai Gon, TPHCM' }
    // ];

    // const patientDocs = [];
    // for (const p of patientsData) {
    //   let user = await User.findOne({ email: p.email });
    //   if (!user) {
    //     const hashedPassword = await bcrypt.hash(p.password, 10);
    //     user = await User.create({
    //       fullName: p.fullName,
    //       email: p.email,
    //       password: hashedPassword,
    //       role: 'patient'
    //     });
    //   }

    //   let patient = await Patient.findOne({ user: user._id });
    //   if (!patient) {
    //     patient = await Patient.create({
    //       user: user._id,
    //       address: p.address,
    //       bio: '',
    //       medicalHistory: ''
    //     });
    //   }

    //   patientDocs.push(patient);
    // }
    // console.log(`👨‍👩‍👧 ${patientDocs.length} patients seeded successfully`);

    // // ----------- Seed Appointments for 1 doctor + 1 patient only -----------
    // const randomDoctor = doctorDocs[Math.floor(Math.random() * doctorDocs.length)];
    // const randomPatient = patientDocs[Math.floor(Math.random() * patientDocs.length)];

    // const appointments = [];
    // const now = new Date();

    // for (let i = 0; i < 3; i++) {
    //   appointments.push({
    //     doctor: randomDoctor._id,
    //     patient: randomPatient._id,
    //     location: randomDoctor.location,
    //     specialty: randomDoctor.specialty,
    //     datetime: new Date(now.getTime() + (i + 1) * 3600 * 1000), // trong tương lai
    //     date: now.toISOString().slice(0, 10),
    //     time: `${9 + i}:00`,
    //     reason: `Test appointment ${i + 1}`,
    //     status: 'confirmed',
    //     isVerified: true
    //   });
    // }

    // await Appointment.insertMany(appointments);
    // console.log(`📅 3 appointments created for doctor ${randomDoctor._id} & patient ${randomPatient._id}`);

    // // ----------- In ra thông tin đăng nhập của doctor và patient này -----------
    // const doctorUser = await User.findById(randomDoctor.user);
    // const patientUser = await User.findById(randomPatient.user);

    // console.log('💻 Doctor login:');
    // console.log(`  Email: ${doctorUser.email}`);
    // console.log(`  Password: 123456`);

    // console.log('💻 Patient login:');
    // console.log(`  Email: ${patientUser.email}`);
    // console.log(`  Password: 123456`);

    console.log('🎉 Seed data completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();


// // scripts/seedData.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const dotenv = require('dotenv');
// dotenv.config();

// const User = require('../models/User');
// const Doctor = require('../models/Doctor');
// const Patient = require('../models/Patient');
// const Location = require('../models/Location');
// const Specialty = require('../models/Specialty');

// const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => {
//     console.error('❌ MongoDB connection error:', err);
//     process.exit(1);
//   });

// // Chuyển tiếng Việt có dấu -> không dấu, chữ thường, bỏ khoảng trắng
// const normalizeForEmail = (str) => str
//   .normalize('NFD')
//   .replace(/[\u0300-\u036f]/g, '')
//   .replace(/\s+/g, '')
//   .toLowerCase();

// const seedData = async () => {
//   try {
//     // ----------- Xóa dữ liệu cũ -----------
//     await User.deleteMany({});
//     await Doctor.deleteMany({});
//     await Patient.deleteMany({});
//     await Location.deleteMany({});
//     await Specialty.deleteMany({});
//     console.log('🗑️ Old data cleared');

//     // ----------- Seed Locations -----------
//     const locations = await Location.insertMany([
//       { name: 'Bệnh viện A' },
//       { name: 'Phòng khám B' },
//       { name: 'Trung tâm Y tế C' }
//     ]);
//     console.log(`🏥 ${locations.length} cơ sở đã seed`);

//     // ----------- Seed Specialties -----------
//     const specialties = await Specialty.insertMany([
//       { name: 'Nhi khoa', locations: locations.map(l => l._id) },
//       { name: 'Tim mạch', locations: locations.map(l => l._id) },
//       { name: 'Da liễu', locations: locations.map(l => l._id) }
//     ]);
//     console.log(`🩺 ${specialties.length} chuyên khoa đã seed`);

//     // ----------- Seed Doctors (User role=doctor) -----------
//     for (const spec of specialties) {
//       for (const loc of locations) {
//         const hashedPassword = await bcrypt.hash('123456', 10);

//         await User.create({
//           fullName: `${spec.name} Doctor at ${loc.name}`,
//           email: `${normalizeForEmail(spec.name)}_${normalizeForEmail(loc.name)}@demo.com`,
//           password: hashedPassword,
//           role: 'doctor',
//           specialty: spec._id,
//           location: loc._id
//         });
//       }
//     }
//     console.log('👨‍⚕️ Doctors and Users seeded successfully');

//     // ----------- Seed Patients (User role=patient) -----------
//     const patientsData = [
//       { fullName: 'Nguyen Van A', email: 'patient_a@demo.com', password: '123456' },
//       { fullName: 'Tran Thi B', email: 'patient_b@demo.com', password: '123456' },
//       { fullName: 'Le Van C', email: 'patient_c@demo.com', password: '123456' },
//     ];

//     for (const p of patientsData) {
//       const hashedPassword = await bcrypt.hash(p.password, 10);
//       await User.create({
//         fullName: p.fullName,
//         email: p.email,
//         password: hashedPassword,
//         role: 'patient'
//       });
//     }
//     console.log(`👨‍👩‍👧 ${patientsData.length} patients seeded successfully`);

//     console.log('🎉 Seed data completed!');
//     process.exit(0);

//   } catch (err) {
//     console.error('❌ Error seeding data:', err);
//     process.exit(1);
//   }
// };

// seedData();
