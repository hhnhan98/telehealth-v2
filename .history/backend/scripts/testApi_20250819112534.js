// scripts/testApi.js
const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function testEndpoints() {
  try {
    console.log("=== 1. Test /api/users/me ===");
    let token = '';
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'doctor1@demo.com',
        password: '123456'
      });
      token = loginRes.data.token;
      console.log("Login success, token:", token);
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      return;
    }

    try {
      const userRes = await axios.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("User profile:", userRes.data);
    } catch (err) {
      console.error("/users/me failed:", err.response?.data || err.message);
    }

    console.log("\n=== 2. Test /api/appointments ===");
    try {
      const appointmentsRes = await axios.get(`${API_BASE}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Appointments:", appointmentsRes.data);
    } catch (err) {
      console.error("/appointments failed:", err.response?.data || err.message);
    }

    console.log("\n=== 3. Test /api/appointments/locations ===");
    try {
      const locationsRes = await axios.get(`${API_BASE}/appointments/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Locations:", locationsRes.data);
    } catch (err) {
      console.error("/appointments/locations failed:", err.response?.data || err.message);
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

testEndpoints();
