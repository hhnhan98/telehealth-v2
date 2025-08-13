const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
