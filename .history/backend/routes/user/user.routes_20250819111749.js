// routes/user/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/user.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

/**
 * Public / Admin Routes
 */

// [GET] /api/users
// Lấy tất cả user (có thể lọc theo role hoặc specialty)
// Quyền: public hoặc admin
router.get('/', userController.getAllUsers);

// [GET] /api/users/doctors?specialty=...
// Lấy danh sách bác sĩ theo chuyên khoa
// Quyền: public
router.get('/doctors', userController.getDoctorsBySpecialty);

/**
 * Authenticated User Routes

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

// // routes/user/user.routes.js
// const express = require('express');
// const router = express.Router();
// const userController = require('../../controllers/user/user.controller');
// const { verifyToken } = require('../../middlewares/auth/auth');

// /**
//  * [GET] /api/users
//  * Lấy tất cả user (có thể lọc theo role hoặc specialty)
//  * Quyền: public hoặc admin (tuỳ business logic)
//  */
// router.get('/', userController.getAllUsers);

// /**
//  * [GET] /api/users/doctors?specialty=...
//  * Lấy danh sách bác sĩ theo chuyên khoa
//  * Dùng khi bệnh nhân đặt lịch
//  */
// router.get('/doctors', userController.getDoctorsBySpecialty);

// /**
//  * [GET] /api/users/me
//  * Lấy thông tin cá nhân của user đang đăng nhập
//  * Quyền: user phải đăng nhập (verifyToken)
//  */
// router.get('/me', verifyToken, userController.getMyProfile);

// /**
//  * [PUT] /api/users/me
//  * Cập nhật thông tin cá nhân của user đang đăng nhập
//  * Quyền: user phải đăng nhập
//  */
// router.put('/me', verifyToken, userController.updateMyProfile);

// /**
//  * [GET] /api/users/:id
//  * Lấy user theo ID
//  * Quyền: admin hoặc hệ thống
//  */
// router.get('/:id', userController.getUserById);

// /**
//  * [POST] /api/users
//  * Tạo user mới
//  * Quyền: admin hoặc hệ thống
//  */
// router.post('/', userController.createUser);

// /**
//  * [PUT] /api/users/:id
//  * Cập nhật user theo ID
//  * Quyền: admin
//  */
// router.put('/:id', userController.updateUser);

// /**
//  * [DELETE] /api/users/:id
//  * Xoá user theo ID
//  * Quyền: admin
//  */
// router.delete('/:id', userController.deleteUser);

// module.exports = router;
