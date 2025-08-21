const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// Optional: trả về JSON sạch nếu cần
locationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Location', locationSchema);
