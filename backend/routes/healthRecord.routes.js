const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecord.controller');
const { protect } = require('../middlewares/auth');

console.log('TEST getAllHealthRecords:', typeof healthRecordController.getAllHealthRecords);

// GET tất cả hồ sơ bệnh án (tuỳ chọn lọc theo bệnh nhân hoặc bác sĩ)
router.get('/', protect, healthRecordController.getAllHealthRecords);

// GET chi tiết hồ sơ theo ID
router.get('/:id', protect, healthRecordController.getHealthRecordById);

// POST tạo hồ sơ bệnh án
router.post('/', protect, healthRecordController.createHealthRecord);

// PATCH cập nhật hồ sơ bệnh án
router.patch('/:id', protect, healthRecordController.updateHealthRecord);

// DELETE xoá hồ sơ
router.delete('/:id', protect, healthRecordController.deleteHealthRecord);

module.exports = router;
