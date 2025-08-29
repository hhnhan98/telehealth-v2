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
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    medicalHistory: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fields lấy thông tin cơ bản từ User
patientSchema.virtual('fullName').get(function () {
  return this.user?.fullName || '';
});

patientSchema.virtual('avatar').get(function () {
  return this.user?.avatar || '/uploads/default-avatar.png';
});

patientSchema.virtual('phone').get(function () {
  return this.user?.phone || '';
});

patientSchema.virtual('birthYear').get(function () {
  return this.user?.birthYear || null;
});

patientSchema.virtual('age').get(function () {
  if (this.user?.birthYear) {
    return new Date().getFullYear() - this.user.birthYear;
  }
  return null;
});

module.exports = mongoose.model('Patient', patientSchema);
