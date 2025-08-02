const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const medicalRecordController = require('../controllers/medicalRecordController');
const User = require('../models/User');

// Middleware kiểm tra vai trò bác sĩ
const isDoctor = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user && user.role === 'doctor') return next();
  return res.status(403).json({ error: 'Chỉ bác sĩ mới có quyền thực hiện thao tác này' });
};

// Middleware kiểm tra vai trò bệnh nhân
const isPatient = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user && user.role === 'patient') return next();
  return res.status(403).json({ error: 'Chỉ bệnh nhân mới có quyền thực hiện thao tác này' });
};

// ✅ Bác sĩ tạo hồ sơ khám bệnh mới
router.post('/', verifyToken, isDoctor, medicalRecordController.createMedicalRecord);

// ✅ Bác sĩ lấy tất cả hồ sơ (có thể thêm lọc theo bệnh nhân sau)
router.get('/', verifyToken, isDoctor, medicalRecordController.getAllMedicalRecords);

// ✅ Lấy hồ sơ theo ID (bác sĩ được xem tất cả, bệnh nhân chỉ xem của mình)
router.get('/:id', verifyToken, medicalRecordController.getMedicalRecordById);

// ✅ Bác sĩ cập nhật hồ sơ
router.put('/:id', verifyToken, isDoctor, medicalRecordController.updateMedicalRecord);

// ✅ Bác sĩ xoá hồ sơ
router.delete('/:id', verifyToken, isDoctor, medicalRecordController.deleteMedicalRecord);

module.exports = router;
