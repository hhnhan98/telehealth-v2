// routes/location/location.routes.js
const express = require('express');
const router = express.Router();

// Controller xử lý logic location
const { getAllLocations, createLocation } = require('../../controllers/location/location.controller');

// Middleware xác thực và phân quyền
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

/**
 * [GET] /api/locations/
 * Lấy danh sách tất cả cơ sở y tế
 * Public, không cần đăng nhập
 */
router.get('/', getAllLocations);

/**
 * [POST] /api/locations/
 * Tạo mới cơ sở y tế
 * Chỉ admin mới được phép
 */
router.post('/', verifyToken, authorize('admin'), createLocation);

module.exports = router;
