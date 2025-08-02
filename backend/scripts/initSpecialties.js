require('dotenv').config();
const mongoose = require('mongoose');
const Specialty = require('../models/Specialty');

const specialties = [
  { name: 'Tim mạch' },
  { name: 'Nội tiết' },
  { name: 'Thần kinh' },
  { name: 'Hô hấp' },
  { name: 'Da liễu' },
];

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');

  for (const sp of specialties) {
    const exists = await Specialty.findOne({ name: sp.name });
    if (!exists) {
      await Specialty.create(sp);
      console.log(`Added specialty: ${sp.name}`);
    } else {
      console.log(`Specialty already exists: ${sp.name}`);
    }
  }

  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
});