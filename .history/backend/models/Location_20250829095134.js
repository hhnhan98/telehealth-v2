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

// ===== Cascade delete specialties khi xóa location =====
locationSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await Specialty.deleteMany({ location: doc._id });
  }
  next();
});
module.exports = mongoose.model('Location', locationSchema);

// const mongoose = require('mongoose');

// const locationSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, unique: true, trim: true },
//     address: { type: String, default: '' },
//     specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
//     doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   },
//   { timestamps: true }
// );

// locationSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   return obj;
// };

// module.exports = mongoose.model('Location', locationSchema);
