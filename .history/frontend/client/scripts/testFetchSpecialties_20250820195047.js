// scripts/testFetchSpecialties.js
const path = require('path');
const bookingService = require(path.join(__dirname, '../../client/src/services/bookingService.js'));
const assert = require('assert');

(async () => {
  try {
    const locations = await bookingService.fetchLocations();
    if (!locations.length) {
      console.log('❌ Không có cơ sở nào để test.');
      return;
    }

    console.log(`✅ Tìm thấy ${locations.length} cơ sở. Bắt đầu test chuyên khoa...`);

    for (const loc of locations) {
      const specialties = await bookingService.fetchSpecialties(loc._id);
      const specialtyNames = specialties.map(s => s.name).join(', ') || 'Trống';
      console.log(`Cơ sở: ${loc.name} (${loc._id}) => Chuyên khoa: ${specialtyNames}`);

      // Kiểm tra mỗi chuyên khoa có chứa cơ sở
      for (const spec of specialties) {
        assert(
          spec.locations.includes(loc._id),
          `❌ Chuyên khoa ${spec.name} không thuộc cơ sở ${loc.name}`
        );
      }
    }

    console.log('🎉 Test hoàn tất: tất cả chuyên khoa đều đúng với cơ sở.');
  } catch (err) {
    console.error('❌ Lỗi khi test:', err);
  }
})();
