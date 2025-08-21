const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên chuyên khoa'],
      trim: true,
    },
    // Một chuyên khoa có thể thuộc nhiều cơ sở
    locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true, // ít nhất phải có 1 cơ sở
      },
    ],
    // Danh sách bác sĩ gắn với chuyên khoa này
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
specialtySchema.index({ name: 1, locations: 1 }, { unique: true });

// Optional: trả về JSON "sạch" khi gọi toJSON
specialtySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Specialty', specialtySchema);
