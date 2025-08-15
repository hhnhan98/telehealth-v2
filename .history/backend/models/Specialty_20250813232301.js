const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
}, {
  timestamps: true // Tự động có createdAt, updatedAt
});

module.exports = mongoose.model('Specialty', specialtySchema);
