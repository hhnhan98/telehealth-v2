const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    // medicalHistory: {
    //   type: String,
    //   trim: true,
    //   default: '',
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
