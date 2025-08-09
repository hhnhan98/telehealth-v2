const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  icon: {
    type: String,
    default: '', // 👉 URL hoặc tên biểu tượng (nếu dùng FontAwesome, HeroIcons,...)
  },
}, {
  timestamps: true // Tự động tạo `createdAt` và `updatedAt`
});

module.exports = mongoose.model('Specialty', specialtySchema);