// routes/user/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Lấy tất cả user (có thể lọc theo role hoặc specialty)
router.get('/', userController.getAllUsers);

// Lấy danh sách bác sĩ theo chuyên khoa
router.get('/doctors', userController.getDoctorsBySpecialty);

// Lấy thông tin cá nhân của user đang đăng nhập
router.get('/me', verifyToken, userController.getMyProfile);

// Cập nhật thông tin cá nhân của user đang đăng nhập
router.put('/me', verifyToken, userController.updateMyProfile);

// Admin Routes
router.get('/:id', verifyToken, authorize('admin'), userController.getUserById);
router.post('/', verifyToken, authorize('admin'), userController.createUser);
router.put('/:id', verifyToken, authorize('admin'), userController.updateUser);
router.delete('/:id', verifyToken, authorize('admin'), userController.deleteUser);

module.exports = router;