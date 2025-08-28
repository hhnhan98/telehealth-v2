const mongoose = require('mongoose');

// Thuốc kê đơn
const prescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },     // Tên thuốc
  dose: { type: String, required: true },     // Liều dùng (VD: 2 viên/ngày)
  quantity: { type: Number, required: true, min: 1 }, // Số lượng
  note: { type: String, default: '' },        // Ghi chú thêm
});

// Hồ sơ bệnh án
const medicalRecordSchema = new mongoose.Schema(
  {
    appointment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appointment', 
      required: true, 
      unique: true 
    },

    // Lưu tham chiếu để sau này truy vấn liên kết
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // --- SNAPSHOT: thông tin được lưu lại vĩnh viễn ---
    doctorSnapshot: {
      fullName: { type: String, required: true },
      specialty: { type: String, default: '' },
    },
    patientSnapshot: {
      fullName: { type: String, required: true },
      birthYear: { type: Number },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
    },

    // --- Thông tin khám bệnh ---
    date: { type: Date, default: Date.now }, // Ngày khám
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bp: { type: String },     // Huyết áp
    pulse: { type: Number },  // Nhịp tim
    bmi: { type: Number },    // Chỉ số BMI

    symptoms: { type: String, required: true },  // Triệu chứng
    diagnosis: { type: String, required: true }, // Chẩn đoán
    notes: { type: String },                     // Ghi chú nội bộ

    prescriptions: [prescriptionSchema],         // Danh sách thuốc
    conclusion: { type: String, default: '' },   // Kết luận
    careAdvice: { type: String, default: '' },   // Lời dặn dò chăm sóc
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
