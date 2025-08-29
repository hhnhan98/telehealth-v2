const mongoose = require('mongoose');
const Specialty = require('./Specialty');

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

locationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

// Tự động xóa các chuyên khoa liên kết khi xóa cơ sở y tế
locationSchema.pre('findOneAndDelete', async function(next) {
const location = await this.model.findOne(this.getFilter());
if (location) {
  await Specialty.deleteMany({ location: location._id });
}
  next();
});

module.exports = mongoose.model('Location', locationSchema);