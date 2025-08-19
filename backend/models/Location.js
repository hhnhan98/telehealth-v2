const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên cơ sở y tế'],
      trim: true,
    },
  },
  { timestamps: true }
);

// Optional: trả về JSON sạch
locationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Location', locationSchema);

// const mongoose = require('mongoose');

// const locationSchema = new mongoose.Schema({
//   name: { type: String, required: true }
// });

// module.exports = mongoose.model('Location', locationSchema);
