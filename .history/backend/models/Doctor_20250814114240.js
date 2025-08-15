const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }
});

module.exports = mongoose.model('Doctor', doctorSchema);
