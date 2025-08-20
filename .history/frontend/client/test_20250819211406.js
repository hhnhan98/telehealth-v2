// scripts/testAdminUpdate.js
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api/admin',
  headers: {
    Authorization: 'Bearer YOUR_ADMIN_TOKEN_HERE', // Thay token admin
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
