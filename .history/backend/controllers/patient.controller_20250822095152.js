const Patient = require('../models/Patient');
const User = require('../models/User');
const path = require('path');
const fs = require('fs'); 

// === Lấy hồ sơ bệnh nhân hiện đang đăng nhập ===
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio')
      .lean();

    if (!patient) return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân' });

    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy hồ sơ bệnh nhân', details: err.message });
  }
};

// === Cập nhật hồ sơ bệnh nhân ===
const updateMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân' });

    // Cập nhật các trường patient
    const patientFields = ['address', 'bio', 'medicalHistory'];
    patientFields.forEach(field => {
      if (req.body[field] !== undefined) patient[field] = req.body[field];
    });

    await patient.save();

    // Cập nhật các trường user
    const userFields = ['fullName', 'birthYear', 'gender', 'phone', 'bio'];
    const user = await User.findById(req.user._id);

    userFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Upload avatar nếu có file
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;

      // Xóa avatar cũ nếu tồn tại và không phải avatar mặc định
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const oldPath = path.join(__dirname, '../public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.avatar = avatarPath;
    }

    await user.save();

    // Trả về hồ sơ đầy đủ sau khi update
    const updatedPatient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio');

    res.json({ patient: updatedPatient });
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật hồ sơ', details: err.message });
  }
}

// Lấy danh sách bệnh nhân, kèm thông tin user (họ tên, ngày sinh) và các trường bổ sung nếu cần
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'fullName email bio') // Lấy thông tin user cần thiết
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
  getMyProfile,
  updateMyProfile,
};
