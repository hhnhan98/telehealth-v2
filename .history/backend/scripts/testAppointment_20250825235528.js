// testAppointmentAuto.js
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Appointment = require('./models/Appointment'); // đường dẫn đúng tới model Appointment

const API_URL = 'http://localhost:5000/api/appointments'; // đổi port nếu cần
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYxMzQ3MDMsImV4cCI6MTc1NjIyMTEwM30.UScFTaXW0Ps3WYrL5rNWAZmLtPtnEEh5qJutHcC7opQ'; // token JWT của bác sĩ

async function testAppointment() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Lấy 1 appointment bất kỳ
    const appointment = await Appointment.findOne();
    if (!appointment) {
      console.log('❌ Không có appointment nào trong DB');
      return;
    }

    console.log('Test appointment ID:', appointment._id.toString());

    // Gọi API
    const { data } = await axios.get(`${API_URL}/${appointment._id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    console.log('✅ API response:', data);
  } catch (err) {
    console.error('❌ Lỗi khi test appointment:', err.response?.status, err.response?.data || err.message);
  } finally {
    mongoose.disconnect();
  }
}

testAppointment();
