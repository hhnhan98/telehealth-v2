// controllers/medicalRecord.controller.js
const MedicalRecord = require('../models/MedicalRecord');

// Lấy danh sách hồ sơ bệnh án theo patient
const getRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'fullName')
      .sort({ visitDate: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy hồ sơ bệnh án', details: err.message });
  }
};

// Tạo hồ sơ bệnh án mới
const createMedicalRecord = async (req, res) => {
  try {
    const { patient, doctor, symptoms, diagnosis, prescriptions, notes, visitDate } = req.body;
    if (!patient || !doctor || !symptoms) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const newRecord = new MedicalRecord({
      patient,
      doctor,
      symptoms,
      diagnosis,
      prescriptions,
      notes,
      visitDate,
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi tạo hồ sơ bệnh án', details: err.message });
  }
};

// Cập nhật hồ sơ bệnh án
const updateMedicalRecord = async (req, res) => {
  try {
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh án' });
    }
    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật hồ sơ bệnh án', details: err.message });
  }
};

// Xóa hồ sơ bệnh án
const deleteMedicalRecord = async (req, res) => {
  try {
    const deletedRecord = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh án' });
    }
    res.json({ message: 'Xóa hồ sơ bệnh án thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa hồ sơ bệnh án', details: err.message });
  }
};

module.exports = {
  getRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};
