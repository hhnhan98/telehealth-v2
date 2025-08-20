const axios = require('axios');

const API_URL = 'http://localhost:5000/api'; // sửa theo backend của bạn

// Lưu _id để update/delete
let testUserId = null;
let testLocationId = null;
let testSpecialtyId = null;

async function runTest() {
  try {
    console.log('1. Lấy dữ liệu ban đầu');
    const usersRes = await axios.get(`${API_URL}/users`);
    console.log('--- Users ---', usersRes.data);

    const locationsRes = await axios.get(`${API_URL}/locations`);
    console.log('--- Locations ---', locationsRes.data);

    const specialtiesRes = await axios.get(`${API_URL}/specialties`);
    console.log('--- Specialties ---', specialtiesRes.data);

    console.log('\n2. Thêm user test');
    const addUserRes = await axios.post(`${API_URL}/users`, {
      fullName: 'Test User',
      email: `testuser_${Date.now()}@demo.com`,
      role: 'patient',
      phone: '0123456789',
      gender: 'other'
    });
    testUserId = addUserRes.data.user._id;
    console.log('Thêm user thành công:', addUserRes.data);

    console.log('\n3. Sửa user test');
    const updateUserRes = await axios.put(`${API_URL}/users/${testUserId}`, {
      fullName: 'Test User Updated',
      phone: '0987654321'
    });
    console.log('Cập nhật user thành công:', updateUserRes.data);

    console.log('\n4. Thêm location test');
    const addLocationRes = await axios.post(`${API_URL}/locations`, {
      name: `Test Location ${Date.now()}`
    });
    testLocationId = addLocationRes.data._id;
    console.log('Thêm location thành công:', addLocationRes.data);

    console.log('\n5. Thêm specialty test');
    const addSpecialtyRes = await axios.post(`${API_URL}/specialties`, {
      name: `Test Specialty ${Date.now()}`,
      location: [testLocationId] // liên kết với location vừa tạo
    });
    testSpecialtyId = addSpecialtyRes.data._id;
    console.log('Thêm specialty thành công:', addSpecialtyRes.data);

    console.log('\n6. Xóa dữ liệu test');

    if (testSpecialtyId) {
      await axios.delete(`${API_URL}/specialties/${testSpecialtyId}`);
      console.log('Xóa specialty thành công');
    }

    if (testLocationId) {
      await axios.delete(`${API_URL}/locations/${testLocationId}`);
      console.log('Xóa location thành công');
    }

    if (testUserId) {
      await axios.delete(`${API_URL}/users/${testUserId}`);
      console.log('Xóa user thành công');
    }

    console.log('\n7. Kiểm tra dữ liệu cuối cùng');
    const finalUsers = await axios.get(`${API_URL}/users`);
    console.log('--- Users ---', finalUsers.data);

    const finalLocations = await axios.get(`${API_URL}/locations`);
    console.log('--- Locations ---', finalLocations.data);

    const finalSpecialties = await axios.get(`${API_URL}/specialties`);
    console.log('--- Specialties ---', finalSpecialties.data);

  } catch (error) {
    console.error('Lỗi test:', error.response?.data || error.message);
  }
}

runTest();
