const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Tạo hồ sơ mới
router.post('/', medicalRecordController.createMedicalRecord);

// Lấy tất cả hồ sơ
router.get('/', medicalRecordController.getAllMedicalRecords);

// Lấy hồ sơ theo ID
router.get('/:id', medicalRecordController.getMedicalRecordById);

// Cập nhật hồ sơ
router.put('/:id', medicalRecordController.updateMedicalRecord);

// Xoá hồ sơ
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

module.exports = router;