const express = require('express');
const router = express.Router();

const { getAllLocations, createLocation } = require('../../controllers/location/location.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/role');

// Lấy tất cả địa điểm (public)
router.get('/', getAllLocations);

// Chỉ admin mới được tạo địa điểm
router.post('/', verifyToken, authorize('admin'), createLocation);

module.exports = router;
