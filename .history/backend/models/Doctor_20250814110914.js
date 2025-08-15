const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  password: { type: String, required: true }

  email: { type: String, required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
});

module.exports = mongoose.model('Doctor', doctorSchema);
