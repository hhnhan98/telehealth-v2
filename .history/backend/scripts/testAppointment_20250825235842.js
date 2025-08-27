// testAppointmentAuto.js
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Appointment = require('../models/Appointment'); // đường dẫn đúng tới model Appointment

const API_URL = 'http://localhost:5000/api/appointments'; // đổi port nếu cần
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFkNmU0NWZmM2I1NTQyYjdiMzA2NiIsInJvbGUiOiJkb2N0b3IiLCJpYXQiOjE3NTYxNDExMDgsImV4cCI6MTc1NjIyNzUwOH0.unQWJ_LK_ch8B6vyhNXJLXXe-ubD9jGSwn4STOHcG-4'; // token JWT của bác sĩ

async function testAppointment() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
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
