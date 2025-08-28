// scripts/migrateSpecLoc.js
require('dotenv').config();
const mongoose = require('mongoose');

const Specialty = require('../models/Specialty');

const MONGO_URI = process.env.MONGODB_URI;

const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Lấy tất cả specialties dưới dạng plain object
    const specialties = await mongoose.connection.db.collection('specialties').find().toArray();
    console.log(`Found ${specialties.length} specialties to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const spec of specialties) {
      if (!spec.locations || !Array.isArray(spec.locations) || spec.locations.length === 0) {
        console.log(`Skipping Specialty: ${spec.name} (no locations)`);
        skippedCount++;
        continue;
      }

      const locationId = spec.locations[0]; // lấy location đầu tiên
      await mongoose.connection.db.collection('specialties').updateOne(
        { _id: spec._id },
        { $set: { location: locationId }, $unset: { locations: "" } }
      );

      console.log(`Migrated Specialty: ${spec.name} → location: ${locationId}`);
      migratedCount++;
    }

    console.log(`Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrate();
