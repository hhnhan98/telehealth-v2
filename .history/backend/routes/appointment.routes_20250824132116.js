const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const bookingController = require('../controllers/booking.controller');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Quản lý lịch hẹn khám bệnh
 */

/**
 * @swagger
 * /api/appointments/locations:
 *   get:
 *     summary: Lấy danh sách cơ sở
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Danh sách cơ sở
 */
router.get('/locations', bookingController.getLocations);

/**
 * @swagger
 * /api/appointments/specialties:
 *   get:
 *     summary: Lấy danh sách chuyên khoa theo cơ sở
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID cơ sở
 *     responses:
 *       200:
 *         description: Danh sách chuyên khoa
 */
router.get('/specialties', bookingController.getSpecialtiesByLocation);

/**
 * @swagger
 * /api/appointments/doctors:
 *   get:
 *     summary: Lấy danh sách bác sĩ theo chuyên khoa và cơ sở
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID chuyên khoa
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID cơ sở
 *     responses:
 *       200:
 *         description: Danh sách bác sĩ
 */
router.get('/doctors', bookingController.getDoctorsBySpecialtyAndLocation);

/**
 * @swagger
 * /api/appointments/available-slots:
 *   get:
 *     summary: Lấy khung giờ trống của bác sĩ
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID bác sĩ
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Ngày cần lấy slot (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách khung giờ trống
 */
router.get('/available-slots', bookingController.getAvailableSlots);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Tạo lịch hẹn mới
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo lịch hẹn thành công
 */
router.post('/', verifyToken, bookingController.createAppointment);

/**
 * @swagger
 * /api/appointments/verify-otp:
 *   post:
 *     summary: Xác thực OTP khi tạo lịch hẹn
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP hợp lệ
 */
router.post('/verify-otp', verifyToken, bookingController.verifyOtp);

/**
 * @swagger
 * /api/appointments/resend-otp:
 *   post:
 *     summary: Gửi lại OTP
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gửi lại OTP thành công
 */
router.post('/resend-otp', verifyToken, bookingController.resendOtpController);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Hủy lịch hẹn theo ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID lịch hẹn
 *     responses:
 *       200:
 *         description: Hủy lịch hẹn thành công
 */
router.delete('/:id', verifyToken, bookingController.cancelAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Lấy danh sách lịch hẹn của user hiện tại
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách lịch hẹn
 */
router.get('/', verifyToken, bookingController.getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch hẹn theo ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID lịch hẹn
 *     responses:
 *       200:
 *         description: Thông tin chi tiết lịch hẹn
 */
router.get('/:id', verifyToken, bookingController.getAppointmentById);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middlewares/auth');
// const bookingController = require('../controllers/booking.controller');

// // ========================= Dropdown APIs =========================
// // Lấy danh sách cơ sở
// router.get('/locations', bookingController.getLocations);

// // Lấy danh sách chuyên khoa theo cơ sở
// router.get('/specialties', bookingController.getSpecialtiesByLocation);

// // Lấy danh sách bác sĩ theo chuyên khoa và cơ sở
// router.get('/doctors', bookingController.getDoctorsBySpecialtyAndLocation);

// // Lấy khung giờ trống của bác sĩ
// router.get('/available-slots', bookingController.getAvailableSlots);

// // ===================== Appointment Management =====================
// // Tạo lịch hẹn mới (bắt buộc login)
// router.post('/', verifyToken, bookingController.createAppointment);

// // Xác thực OTP khi tạo lịch
// router.post('/verify-otp', verifyToken, bookingController.verifyOtp);

// // Gửi lại OTP nếu cần
// router.post('/resend-otp', verifyToken, bookingController.resendOtpController);

// // Hủy lịch hẹn theo ID
// router.delete('/:id', verifyToken, bookingController.cancelAppointment);

// // Lấy danh sách lịch hẹn của user hiện tại
// router.get('/', verifyToken, bookingController.getAppointments);

// router.get('/:id', verifyToken, bookingController.getAppointmentById);

// module.exports = router;