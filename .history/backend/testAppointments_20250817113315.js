// testAppointments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

const mongoURI = process.env.MONGODB_URI;

const testConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Kết nối MongoDB thành công');
    console.log('MongoDB state:', mongoose.connection.readyState); // 1 = connected

    const appointments = await Appointment.find({});
    console.log(`Tổng số appointment: ${appointments.length}`);
    appointments.forEach(a => console.log(a));

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi fetch appointments:', err);
    process.exit(1);
  }
};

testConnection();
