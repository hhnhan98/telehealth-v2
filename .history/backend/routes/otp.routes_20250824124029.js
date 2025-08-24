// routes/auth/otp.routes.js
const express = require('express');
const router = express.Router();

// Middleware xác thực token
const { verifyToken } = require('../middlewares/auth');

// Controller xử lý OTP
const { sendOtpForAppointment, verifyAppointmentOtp } = require('../controllers/otp.controller');

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: API quản lý OTP xác thực lịch hẹn
 */

/**
 * @swagger
 * /api/otp/send:
 *   post:
 *     summary: Gửi OTP sau khi tạo lịch hẹn
 *     description: Sau khi bệnh nhân tạo lịch hẹn, hệ thống gửi OTP đến số điện thoại/email để xác thực.
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 example: "64fabc1234def56789abcd01"
 *     responses:
 *       200:
 *         description: OTP đã được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP đã được gửi thành công
 *       400:
 *         description: Thiếu thông tin hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/send', verifyToken, sendOtpForAppointment);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Xác thực OTP
 *     description: Bệnh nhân nhập OTP để xác nhận lịch hẹn.
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - otp
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 example: "64fabc1234def56789abcd01"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP hợp lệ, lịch hẹn được xác nhận
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP hợp lệ, lịch hẹn đã được xác nhận
 *       400:
 *         description: OTP sai hoặc hết hạn
 *       401:
 *         description: Chưa xác thực hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/verify', verifyToken, verifyAppointmentOtp);

module.exports = router;

// const express = require('express');
// const router = express.Router();

// // Middleware xác thực token
// const { verifyToken } = require('../middlewares/auth');

// // Controller xử lý OTP
// const { sendOtpForAppointment, verifyAppointmentOtp } = require('../controllers/otp.controller');

// // ----------------------
// // Gửi OTP sau khi tạo lịch hẹn
// // POST /api/otp/send
// // ----------------------
// router.post('/send', verifyToken, sendOtpForAppointment);

// // ----------------------
// // Xác thực OTP
// // POST /api/otp/verify
// // ----------------------
// router.post('/verify', verifyToken, verifyAppointmentOtp);

// module.exports = router;

