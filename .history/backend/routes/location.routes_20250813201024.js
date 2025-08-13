const express = require('express');
const router = express.Router();
const { getAllLocations, createLocation } = require('../controllers/location.controller.js');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Lấy tất cả địa điểm (ai cũng xem được)
router.get('/', getAllLocations);

// Chỉ admin mới tạo được địa điểm mới
router.post('/', verifyToken, isAdmin, createLocation);

module.exports = router;
