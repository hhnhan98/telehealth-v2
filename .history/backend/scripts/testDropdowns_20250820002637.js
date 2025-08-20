const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/booking'; // chỉnh lại port nếu khác

async function testDropdowns() {
  try {
    console.log('--- 1. Lấy danh sách cơ sở ---');
    const locRes = await axios.get(`${API_BASE}/locations`);
    const locations = locRes.data?.data?.locations || [];
    console.log(`Cơ sở y tế: ${locations.map(l => `${l._id} | ${l.name}`)}`);

    if (!locations.length) {
      console.error('❌ Không có cơ sở y tế nào.');
      return;
    }

    const locId = locations[0]._id;

    console.log('\n--- 2. Lấy danh sách chuyên khoa theo cơ sở ---');
    const specRes = await axios.get(`${API_BASE}/specialties`, { params: { locationId: locId } });
    const specialties = specRes.data?.data?.specialties || [];
    console.log(`Chuyên khoa: ${specialties.map(s => `${s._id} | ${s.name}`)}`);

    if (!specialties.length) {
      console.error('❌ Không có chuyên khoa nào cho cơ sở này.');
      return;
    }

    const specId = specialties[0]._id;

    console.log('\n--- 3. Lấy danh sách bác sĩ theo chuyên khoa + cơ sở ---');
    const docRes = await axios.get(`${API_BASE}/doctors`, { params: { locationId: locId, specialtyId: specId } });
    const doctors = docRes.data?.data?.doctors || [];
    console.log(`Bác sĩ: ${doctors.map(d => `${d._id} | ${d.user?.fullName}`)}`);

    if (!doctors.length) {
      console.error('❌ Không có bác sĩ nào cho chuyên khoa này.');
      return;
    }

    console.log('\n✅ Test dropdowns hoàn tất. Data load OK!');
  } catch (err) {
    console.error('❌ Lỗi testDropdowns:', err.response?.data || err.message);
  }
}

testDropdowns();
