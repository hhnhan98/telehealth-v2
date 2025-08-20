const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên chuyên khoa'],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true, 
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
  },
  { timestamps: true }
);

// Index để tránh trùng tên chuyên khoa trong cùng cơ sở
specialtySchema.index({ name: 1, location: 1 }, { unique: true });

// Optional: trả về JSON sạch nếu cần
specialtySchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Specialty', specialtySchema);

// const mongoose = require('mongoose');

// const specialtySchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }]
// });

// module.exports = mongoose.model('Specialty', specialtySchema);
