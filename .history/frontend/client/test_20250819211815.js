// testAdmin.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/admin';
const ADMIN_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTQ1YTViMzExODNmMjE5M2NlOWFiOSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NTYxMjg1OCwiZXhwIjoxNzU2MjE3NjU4fQ.lvLWnXtJucYw5BQ57o-7qSEwCYvypLDzv7uqY7dBy30', // Thay token admin


const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: ADMIN_TOKEN },
});

async function logData() {
  const users = (await axiosInstance.get('/users')).data.data || [];
  const locations = (await axiosInstance.get('/locations')).data.data || [];
  const specialties = (await axiosInstance.get('/specialties')).data.data || [];
  console.log('--- Users ---', users);
  console.log('--- Locations ---', locations);
  console.log('--- Specialties ---', specialties);
  return { users, locations, specialties };
}

async function testAdminFunctions() {
  console.log('1. Lấy dữ liệu ban đầu');
  await logData();

  // --- Thêm user ---
  console.log('\n2. Thêm user test');
  let newUser;
  try {
    const res = await axiosInstance.post('/users', {
      fullName: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: '123456',
      role: 'patient',
      phone: '0123456789',
      gender: 'other',
    });
    newUser = res.data.data;
    console.log('Thêm user thành công:', newUser);
  } catch (err) {
    console.error('Thêm user lỗi:', err.response?.data || err.message);
  }

  // --- Sửa user ---
  if (newUser) {
    console.log('\n3. Sửa user test');
    try {
      const res = await axiosInstance.put(`/users/${newUser._id}`, {
        fullName: 'Updated Test User',
        phone: '0987654321',
      });
      console.log('Cập nhật user thành công:', res.data.data);
    } catch (err) {
      console.error('Cập nhật user lỗi:', err.response?.data || err.message);
    }
  }

  // --- Thêm location ---
  console.log('\n4. Thêm location test');
  let newLocation;
  try {
    const res = await axiosInstance.post('/locations', {
      name: 'Test Location',
      address: '123 Demo St',
      specialties: [],
    });
    newLocation = res.data.data;
    console.log('Thêm location thành công:', newLocation);
  } catch (err) {
    console.error('Thêm location lỗi:', err.response?.data || err.message);
  }

  // --- Thêm specialty ---
  console.log('\n5. Thêm specialty test');
  let newSpecialty;
  try {
    const res = await axiosInstance.post('/specialties', {
      name: 'Test Specialty',
      description: 'Specialty demo',
      locations: newLocation ? [newLocation._id] : [],
    });
    newSpecialty = res.data.data;
    console.log('Thêm specialty thành công:', newSpecialty);
  } catch (err) {
    console.error('Thêm specialty lỗi:', err.response?.data || err.message);
  }

  // --- Cập nhật location với specialty ---
  if (newLocation && newSpecialty) {
    console.log('\n6. Cập nhật location thêm specialty');
    try {
      const res = await axiosInstance.put(`/locations/${newLocation._id}`, {
        ...newLocation,
        specialties: [newSpecialty._id],
      });
      console.log('Cập nhật location thành công:', res.data.data);
    } catch (err) {
      console.error('Cập nhật location lỗi:', err.response?.data || err.message);
    }
  }

  // --- Xóa các dữ liệu test ---
  console.log('\n7. Xóa dữ liệu test');
  try {
    if (newUser) await axiosInstance.delete(`/users/${newUser._id}`);
    if (newSpecialty) await axiosInstance.delete(`/specialties/${newSpecialty._id}`);
    if (newLocation) await axiosInstance.delete(`/locations/${newLocation._id}`);
    console.log('Xóa dữ liệu test thành công');
  } catch (err) {
    console.error('Xóa dữ liệu lỗi:', err.response?.data || err.message);
  }

  console.log('\n8. Dữ liệu cuối cùng');
  await logData();
}

testAdminFunctions().catch(err => console.error('Script lỗi:', err));

  },
});

async function testAdminCRUD() {
  try {
    console.log('--- 1. Lấy dữ liệu ban đầu ---');
    const usersBefore = await api.get('/users');
    console.log('Users:', usersBefore.data.data);

    const testUser = { fullName: 'Test User', email: 'testuser@example.com', role: 'patient' };
    console.log('\n--- 2. Thêm user test ---');
    const addedUser = await api.post('/users', testUser);
    console.log('Added:', addedUser.data.data);

    console.log('\n--- 3. Cập nhật user test ---');
    const updatedUser = await api.put(`/users/${addedUser.data.data._id}`, { fullName: 'Updated Test User' });
    console.log('Updated:', updatedUser.data.data);

    console.log('\n--- 4. Xóa user test ---');
    await api.delete(`/users/${addedUser.data.data._id}`);
    console.log('Deleted.');

    console.log('\n--- 5. Lấy dữ liệu cuối ---');
    const usersAfter = await api.get('/users');
    console.log('Users:', usersAfter.data.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

testAdminCRUD();
