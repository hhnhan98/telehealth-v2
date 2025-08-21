const HealthRecord = require('../models/MedicalRecord');

// Lấy tất cả hồ sơ (có thể lọc theo bệnh nhân hoặc bác sĩ)
exports.getAllHealthRecords = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;

    const records = await HealthRecord.find(filter)
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách hồ sơ', details: err.message });
  }
};

// Lấy chi tiết hồ sơ theo ID
exports.getHealthRecordById = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!record) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Tạo mới hồ sơ bệnh án
exports.createHealthRecord = async (req, res) => {
  try {
    const { patient, doctor, symptoms, diagnosis, notes, attachments } = req.body;

    const newRecord = new HealthRecord({
      patient,
      doctor,
      symptoms,
      diagnosis,
      notes,
      attachments,
    });

    await newRecord.save();

    const populated = await HealthRecord.findById(newRecord._id)
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName');

    res.status(201).json({ message: 'Tạo hồ sơ thành công', healthRecord: populated });
  } catch (err) {
    res.status(400).json({ error: 'Tạo hồ sơ thất bại', details: err.message });
  }
};

// Cập nhật hồ sơ
exports.updateHealthRecord = async (req, res) => {
  try {
    const updated = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName');

    if (!updated) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

    res.json({ message: 'Cập nhật thành công', healthRecord: updated });
  } catch (err) {
    res.status(400).json({ error: 'Cập nhật thất bại', details: err.message });
  }
};

// Xoá hồ sơ
exports.deleteHealthRecord = async (req, res) => {
  try {
    const deleted = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });

    res.json({ message: 'Đã xoá hồ sơ' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
};