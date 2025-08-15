const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/user.controller');
const { verifyToken } = require('../../middlewares/auth/auth');

// 📌 Lấy tất cả user (có thể lọc theo role, specialty)
router.get('/', userController.getAllUsers);

// 📌 Lấy danh sách bác sĩ theo chuyên khoa (dùng khi bệnh nhân đặt lịch)
// 👉 Ví dụ: /api/users/doctors?specialty=661cb5f7c19e7b7a0a35412a
router.get('/doctors', userController.getDoctorsBySpecialty);

// 📌 Lấy thông tin cá nhân của user đã đăng nhập (dùng token)
router.get('/me', verifyToken, userController.getMyProfile);

// 📌 Cập nhật thông tin cá nhân của user đã đăng nhập (dùng token)
router.put('/me', verifyToken, userController.updateMyProfile);

// 📌 Lấy user theo ID
router.get('/:id', userController.getUserById);

// 📌 Tạo user mới (admin hoặc hệ thống sử dụng)
router.post('/', userController.createUser);

// 📌 Cập nhật user theo ID (admin)
router.put('/:id', userController.updateUser);

// 📌 Xoá user theo ID (admin)
router.delete('/:id', userController.deleteUser);

module.exports = router;
