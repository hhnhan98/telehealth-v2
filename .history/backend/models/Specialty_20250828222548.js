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
