const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

// ✅ Tạo hồ sơ bệnh án mới (chỉ bác sĩ mới có quyền)
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patient, diagnosis, prescription, notes } = req.body;
    const doctor = req.user.id;

    const newRecord = new MedicalRecord({
      patient,
      doctor,
      diagnosis,
      prescription,
      notes,
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo hồ sơ bệnh án', error: error.message });
  }
};

// ✅ Lấy tất cả hồ sơ (chỉ bác sĩ)
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách hồ sơ', error: error.message });
  }
};

// ✅ Lấy chi tiết hồ sơ (cả bác sĩ và bệnh nhân, nhưng kiểm tra quyền truy cập)
exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    }

    // Nếu là bệnh nhân, chỉ cho phép xem hồ sơ của chính mình
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy hồ sơ', error: error.message });
  }
};

// ✅ Cập nhật hồ sơ bệnh án (chỉ bác sĩ)
exports.updateMedicalRecord = async (req, res) => {
  try {
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ để cập nhật' });
    }

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ', error: error.message });
  }
};

// ✅ Xoá hồ sơ bệnh án (chỉ bác sĩ)
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const deleted = await MedicalRecord.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ để xoá' });
    }

    res.json({ message: 'Đã xoá hồ sơ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xoá hồ sơ', error: error.message });
  }
};