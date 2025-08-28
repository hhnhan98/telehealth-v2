// routes/medicalRecord.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { authorize, isDoctor } = require('../middlewares/role');
const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecord.controller');

// ==================== Medical Records Routes ====================

// Tạo phiếu khám bệnh (chỉ bác sĩ)
router.post('/', verifyToken, isDoctor, createMedicalRecord);

// Lấy danh sách phiếu khám (bác sĩ hoặc admin)
router.get('/', verifyToken, authorize('doctor', 'admin'), getMedicalRecords);

// Lấy chi tiết phiếu khám theo ID
// - Admin/Bác sĩ => xem tất cả
// - Bệnh nhân => chỉ được xem hồ sơ của chính mình (check ở controller)
router.get('/:id', verifyToken, getMedicalRecordById);

// Cập nhật phiếu khám (chỉ bác sĩ)
router.patch('/:id', verifyToken, isDoctor, updateMedicalRecord);

// Xoá phiếu khám (bác sĩ hoặc admin)
router.delete('/:id', verifyToken, authorize('doctor', 'admin'), deleteMedicalRecord);

module.exports = router;
