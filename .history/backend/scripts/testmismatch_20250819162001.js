const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const doctors = await Doctor.find({}).populate('specialty location');
  console.log(doctors.map(d => ({
    fullName: d.fullName,
    specialty: d.specialty.name,
    location: d.location.name
  })));
  mongoose.connection.close();
});
