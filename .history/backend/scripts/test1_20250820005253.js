// scripts/test1.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

async function testDropdowns() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Thiếu biến môi trường MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // --- Locations ---
    const locations = await Location.find({});
    console.log('\n--- Locations ---');
    locations.forEach(l => console.log(`${l._id} | ${l.name}`));

    if (!locations.length) return console.error('❌ Không có cơ sở y tế');
    const locId = locations[0]._id;

    // --- Specialties theo location ---
    const specialties = await Specialty.find({ location: locId });
    console.log('\n--- Specialties ---');
    specialties.forEach(s => console.log(`${s._id} | ${s.name} | Location: ${s.location}`));

    if (!specialties.length) return console.error('❌ Không có chuyên khoa cho cơ sở này');
    const specId = specialties[0]._id;

    // --- Doctors theo specialty + location ---
    const doctors = await Doctor.find({ specialty: specId, location: locId })
      .populate('user', 'fullName email')
      .populate('specialty', 'name')
      .populate('location', 'name');

    console.log('\n--- Doctors ---');
    if (!doctors.length) console.error('❌ Không có bác sĩ cho chuyên khoa này');
    else doctors.forEach(d => {
      console.log(`${d._id} | ${d.user?.fullName} | Specialty: ${d.specialty?.name} | Location: ${d.location?.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Test dropdowns completed successfully!');
  } catch (err) {
    console.error('❌ Lỗi testDropdowns:', err);
  }
}

testDropdowns();
