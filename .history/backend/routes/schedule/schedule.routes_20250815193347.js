const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth/auth');
const { isDoctor, authorize } = require('../../middlewares/auth/role');
const scheduleController = require('../../controllers/schedule/schedule.controller');

/**
 * [GET] /api/schedule/available/:doctorId
 * Lấy khung giờ rảnh của bác sĩ theo ngày
 * Quyền: tất cả người dùng đã đăng nhập
 */
router.get('/available/:doctorId', verifyToken, scheduleController.getDoctorAvailableSlots);

/**
 * [GET] /api/schedule/work-schedule
 * Lấy lịch làm việc của bác sĩ (ngày hoặc tuần)
 * Quyền: chỉ bác sĩ
 */
router.get('/work-schedule', verifyToken, isDoctor, scheduleController.getDoctorWorkSchedule);

/**
 * [POST] /api/schedule/create
 * Tạo lịch làm việc mới cho bác sĩ
 * Quyền: chỉ bác sĩ
 * Body: { date, slots: ['08:00','08:30',...] }
 */
router.post('/create', verifyToken, isDoctor, scheduleController.createWorkSchedule);

/**
 * [PUT] /api/schedule/update
 * Cập nhật lịch làm việc (thêm/xóa slot)
 * Quyền: chỉ bác sĩ
 * Body: { date, slots: [{time:'08:00', isBooked:false}, ...] }
 */
router.put('/update', verifyToken, isDoctor, scheduleController.updateWorkSchedule);

/**
 * [DELETE] /api/schedule/delete
 * Xóa lịch làm việc
 * Quyền: chỉ bác sĩ
 * Body: { date }
 */
router.delete('/delete', verifyToken, isDoctor, scheduleController.deleteWorkSchedule);

module.exports = router;
