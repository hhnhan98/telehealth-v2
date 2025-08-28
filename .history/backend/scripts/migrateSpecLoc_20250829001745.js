// migrateSpecialties.js
require('dotenv').config();
const mongoose = require('mongoose');
const Specialty = require('../models/Specialty'); // đường dẫn tới model Specialty

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const specialties = await Specialty.find({ locations: { $exists: true, $ne: [] } });
    console.log(`Found ${specialties.length} specialties to migrate`);

    for (const spec of specialties) {
      // Lấy phần tử đầu tiên trong mảng locations
      spec.location = spec.locations[0];
      // Xóa mảng cũ
      spec.locations = undefined;
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
