const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }
});

module.exports = mongoose.model('Specialty', specialtySchema);
