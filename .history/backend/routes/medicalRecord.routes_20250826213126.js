// routes/medicalRecord.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecord.controller');

// Tạo phiếu khám bệnh
router.post('/', verifyToken, createMedicalRecord);

// Lấy danh sách phiếu khám
router.get('/', verifyToken, getMedicalRecords);

// Lấy chi tiết phiếu khám theo ID
router.get('/:id', verifyToken, getMedicalRecordById);

// Cập nhật phiếu khám
router.patch('/:id', verifyToken, updateMedicalRecord);

// Xoá phiếu khám
router.delete('/:id', verifyToken, deleteMedicalRecord);

module.exports = router;
