const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // mỗi bác sĩ gắn với 1 tài khoản User
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    specialties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialty',
        required: true,
      },
    ],
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    phone: {
      type: String,
      match: [/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'],
    },
    experience: {
      type: Number,
      default: 0,
    },
    biography: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
