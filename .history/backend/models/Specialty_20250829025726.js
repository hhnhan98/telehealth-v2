const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Location', 
      required: [true, 'Location là bắt buộc'] 
    },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Unique index: không cho phép trùng tên specialty trong cùng Location
specialtySchema.index({ name: 1, location: 1 }, { unique: true });

specialtySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Specialty', specialtySchema);

// const mongoose = require('mongoose');

// const specialtySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }],
//     doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   },
//   { timestamps: true }
// );

// specialtySchema.index({ name: 1, locations: 1 }, { unique: true });

// specialtySchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.__v;
//   return obj;
// };

// module.exports = mongoose.model('Specialty', specialtySchema);
