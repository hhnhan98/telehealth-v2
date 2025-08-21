// scripts/printAllData.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/telehealth';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('\n=== USERS ===');
    const users = await User.find().populate('specialty').populate('location');
    users.forEach(u => {
      console.log({
        id: u._id,
        fullName: u.fullName,
        role: u.role,
        email: u.email,
        specialty: u.specialty?.name || null,
        location: u.location?.name || null,
      });
    });

    console.log('\n=== SPECIALTIES ===');
    const specialties = await Specialty.find().populate('doctors').populate('locations');
    specialties.forEach(s => {
      console.log({
        id: s._id,
        name: s.name,
        locations: s.locations.map(l => l.name),
        doctors: s.doctors.map(d => d.fullName),
      });
    });

    console.log('\n=== LOCATIONS ===');
    const locations = await Location.find().populate('specialties').populate('doctors');
    locations.forEach(l => {
      console.log({
        id: l._id,
        name: l.name,
        address: l.address,
        specialties: l.specialties.map(s => s.name),
        doctors: l.doctors.map(d => d.fullName),
      });
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
})();
