const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        type: String, // Đường dẫn file ảnh/pdf (nếu có)
      },
    ],
  },
  {
    timestamps: true, // Tự tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);