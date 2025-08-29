const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Location', 
      required: [true, 'Cơ sở y tế là bắt buộc'] 
    },
    // doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Ràng buộc unique: không cho phép trùng tên chuyên khoa trong cùng cơ sở y tế
specialtySchema.index({ name: 1, location: 1 }, { unique: true });

//
specialtySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Specialty', specialtySchema);