require('dotenv').config();
const mongoose = require('mongoose');
const Specialty = require('../models/Specialty'); // sửa đường dẫn đúng

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Lấy các specialty có mảng locations tồn tại và không rỗng
    const specialties = await Specialty.find({ locations: { $exists: true, $ne: [] } });
    console.log(`Found ${specialties.length} specialties to migrate`);

    for (const spec of specialties) {
      if (!spec.locations || spec.locations.length === 0) {
        console.log(`Skipping Specialty: ${spec.name} (no locations)`);
        continue;
      }

      // Lấy phần tử đầu tiên trong mảng locations
      spec.location = spec.locations[0];
      spec.locations = undefined; // xóa mảng cũ
      await spec.save();
      console.log(`Migrated Specialty: ${spec.name}`);
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
