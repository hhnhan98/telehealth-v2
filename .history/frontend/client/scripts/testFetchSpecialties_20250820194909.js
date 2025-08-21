// testFetchSpecialties.js
const bookingService = require('../../client/'); // điều chỉnh đường dẫn
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
      console.log(`Cơ sở: ${loc.name} (${loc._id}) => Chuyên khoa: ${specialties.map(s => s.name).join(', ') || 'Trống'}`);

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
