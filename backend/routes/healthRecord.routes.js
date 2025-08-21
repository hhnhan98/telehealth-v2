// routes/medicalRecord/healthRecord.routes.js
const express = require('express');
const router = express.Router();
const {
  createHealthRecord,
  getAllHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} = require('../controllers/healthRecord.controller');

// Middleware xác thực và phân quyền
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * [POST] /api/health-records/
 * Tạo hồ sơ sức khỏe mới
 * Chỉ người dùng đã đăng nhập
 */
router.post('/', verifyToken, createHealthRecord);

/**
 * [GET] /api/health-records/
 * Lấy danh sách tất cả hồ sơ sức khỏe
 * Chỉ người dùng đã đăng nhập
 */
router.get('/', verifyToken, getAllHealthRecords);

/**
 * [GET] /api/health-records/:id
 * Lấy chi tiết hồ sơ sức khỏe theo ID
 */
router.get('/:id', verifyToken, getHealthRecordById);

/**
 * [PUT] /api/health-records/:id
 * Cập nhật hồ sơ sức khỏe theo ID
 */
router.put('/:id', verifyToken, updateHealthRecord);

/**
 * [DELETE] /api/health-records/:id
 * Xóa hồ sơ sức khỏe theo ID
 */
router.delete('/:id', verifyToken, deleteHealthRecord);

module.exports = router;
