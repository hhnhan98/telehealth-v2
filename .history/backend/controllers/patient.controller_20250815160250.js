const Patient = require('../../models/Patient');
const User = require('../../models/User');

// Lấy danh sách bệnh nhân, kèm thông tin user (họ tên, ngày sinh) và các trường bổ sung nếu cần
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'fullName dateOfBirth email') // Lấy thông tin user cần thiết
      .sort({ createdAt: -1 });

    // Nếu cần tính thêm các trường như symptoms, diagnosis, lastVisit thì xử lý ở đây trước khi trả về

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách bệnh nhân', details: error.message });
  }
};

// Lấy thông tin 1 bệnh nhân theo id, kèm thông tin user
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'fullName dateOfBirth email');

    if (!patient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin bệnh nhân', details: error.message });
  }
};

const createPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi tạo bệnh nhân', details: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPatient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    res.json(updatedPatient);
  } catch (error) {
    res.status(400).json({ error: 'Lỗi khi cập nhật bệnh nhân', details: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    if (!deletedPatient) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
    res.json({ message: 'Xóa bệnh nhân thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa bệnh nhân', details: error.message });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
