const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: { type: String, default: '' },
  specialties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);

// const mongoose = require('mongoose');

// const locationSchema = new mongoose.Schema({
//   name: { type: String, required: true }
// });

// module.exports = mongoose.model('Location', locationSchema);
