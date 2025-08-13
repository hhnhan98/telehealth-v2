const MedicalRecord = require('../models/MedicalRecord');

exports.createMedicalRecord = async (req, res) => {
  try {
    const { patient, diagnosis, prescription, notes } = req.body;
    if (!patient || !diagnosis) {
      return res.status(400).json({ message: 'patient và diagnosis là bắt buộc' });
    }
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
    res.status(500).json({ message: 'Tạo hồ sơ thất bại', error: error.message });
  }
};

exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách hồ sơ', error: error.message });
  }
};

exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!record) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });

    // Bệnh nhân chỉ xem được hồ sơ của mình
    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập hồ sơ này' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy hồ sơ', error: error.message });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Hồ sơ không tồn tại' });

    if (req.user.role !== 'doctor' || record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật hồ sơ này' });
    }

    Object.assign(record, req.body);
    const updatedRecord = await record.save();

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật hồ sơ', error: error.message });
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Hồ sơ không tồn tại' });

    if (req.user.role !== 'doctor' || record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá hồ sơ này' });
    }

    await record.remove();
    res.json({ message: 'Đã xoá hồ sơ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xoá hồ sơ', error: error.message });
  }
};

exports.getMedicalRecordsByPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.id })
      .populate('doctor', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy hồ sơ của bệnh nhân', error: error.message });
  }
};
