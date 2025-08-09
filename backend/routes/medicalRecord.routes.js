const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const medicalRecordController = require('../controllers/medicalRecord.controller');
const User = require('../models/User');

// Middleware: Kiểm tra nếu người dùng là bác sĩ
const isDoctor = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user?.role === 'doctor') return next();
  return res.status(403).json({ error: 'Chỉ bác sĩ mới có quyền thực hiện thao tác này' });
};

// Middleware: Kiểm tra nếu người dùng là bệnh nhân
const isPatient = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user?.role === 'patient') return next();
  return res.status(403).json({ error: 'Chỉ bệnh nhân mới có quyền thực hiện thao tác này' });
};

// Tạo hồ sơ bệnh án mới (chỉ bác sĩ)
router.post('/', verifyToken, isDoctor, medicalRecordController.createMedicalRecord);

// Lấy danh sách tất cả hồ sơ bệnh án (chỉ bác sĩ)
router.get('/', verifyToken, isDoctor, medicalRecordController.getAllMedicalRecords);

// Lấy chi tiết 1 hồ sơ bệnh án theo ID
router.get('/:id', verifyToken, medicalRecordController.getMedicalRecordById);

// Cập nhật hồ sơ bệnh án theo ID (chỉ bác sĩ)
router.put('/:id', verifyToken, isDoctor, medicalRecordController.updateMedicalRecord);

// Xóa hồ sơ bệnh án theo ID (chỉ bác sĩ)
router.delete('/:id', verifyToken, isDoctor, medicalRecordController.deleteMedicalRecord);

// Lấy danh sách hồ sơ bệnh án theo ID bệnh nhân (cả bác sĩ và bệnh nhân đều dùng)
router.get('/patient/:id', verifyToken, medicalRecordController.getMedicalRecordsByPatient);

module.exports = router;