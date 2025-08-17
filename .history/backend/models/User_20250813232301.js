const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    default: null,
  },
  phone: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  birthYear: { type: Number, default: null },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.pre('save', function (next) {
  if (this.role === 'doctor' && !this.specialty) {
    return next(new Error('Bác sĩ phải có chuyên khoa'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);