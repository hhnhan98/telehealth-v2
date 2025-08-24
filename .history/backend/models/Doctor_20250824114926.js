

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      required: [true, 'Chuyên khoa là bắt buộc'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Cơ sở y tế là bắt buộc'],
    },
    bio: {
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

// Index để tìm theo specialty + location nhanh hơn
doctorSchema.index({ specialty: 1, location: 1 });

// Virtuals để hiển thị thông tin từ User
doctorSchema.virtual('fullName').get(function () {
  return this.user?.fullName || '';
});
doctorSchema.virtual('avatar').get(function () {
  return this.user?.avatar || '';
});
doctorSchema.virtual('phone').get(function () {
  return this.user?.phone || '';
});
doctorSchema.virtual('birthYear').get(function () {
  return this.user?.birthYear || null;
});

module.exports = mongoose.model('Doctor', doctorSchema);
