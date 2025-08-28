// scripts/migrateSpecLoc.js
const mongoose = require('mongoose');
require('dotenv').config();
const Specialty = require('../models/Specialty');

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const specialties = await Specialty.find();
    console.log(`Found ${specialties.length} specialties to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const spec of specialties) {
      // Check if locations exists and is non-empty array
      if (!Array.isArray(spec.locations) || spec.locations.length === 0) {
        console.log(`Skipping Specialty: ${spec.name} (no locations)`);
        skippedCount++;
        continue;
      }

      // Migrate first location from array to single location field
      spec.location = spec.locations[0];
      spec.locations = undefined; // remove old array
      await spec.save();
      console.log(`Migrated Specialty: ${spec.name} -> location: ${spec.location}`);
      migratedCount++;
    }

    console.log(`Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
