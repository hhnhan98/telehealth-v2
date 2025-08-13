const Patient = require('../models/Patient');

// Lấy danh sách bệnh nhân
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bệnh nhân', details: err.message });
  }
};

// Lấy thông tin 1 bệnh nhân
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin bệnh nhân', details: err.message });
  }
};

// Tạo mới bệnh nhân
const createPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi tạo bệnh nhân', details: err.message });
  }
};

// Cập nhật bệnh nhân
const updatePatient = async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    }
    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật bệnh nhân', details: err.message });
  }
};

// Xóa bệnh nhân
const deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) {
      return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    }
    res.json({ message: 'Xóa bệnh nhân thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa bệnh nhân', details: err.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};