const express = require('express');
const router = express.Router();
const { authorize, verifyToken } = require('../middlewares/auth'); // ✅ đúng cú pháp
const userController = require('../controllers/user.controller');

// ✅ Chỉ bác sĩ được phép truy cập danh sách người dùng
router.get('/', verifyToken, authorize('doctor'), userController.getAllUsers);

// ✅ GET profile của chính mình
router.get('/me', verifyToken, userController.getMyProfile);

// ✅ GET user theo ID
router.get('/:id', userController.getUserById);

// ✅ POST tạo user mới
router.post('/', userController.createUser);

// ✅ PUT cập nhật user
router.put('/:id', userController.updateUser);

// ✅ DELETE xoá user
router.delete('/:id', userController.deleteUser);

module.exports = router;