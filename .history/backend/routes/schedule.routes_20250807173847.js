const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { getAvailableSlots } = require('../controllers/schedule.controller');

// 📌 Lấy lịch rảnh của bác sĩ theo ngày
// Ví dụ: /api/schedule/doctorId?date=2025-08-08
router.get('/:doctorId', scheduleController.getDoctorAvailableSlots);

// 📌 Tạo lịch rảnh mới cho bác sĩ (admin hoặc bác sĩ tự tạo)
router.post('/available/:doctorId', getDoctorAvailableSlots); 

// 📌 Cập nhật lịch rảnh theo ID
router.put('/:id', scheduleController.updateSchedule);

// 📌 Xoá lịch rảnh theo ID
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
