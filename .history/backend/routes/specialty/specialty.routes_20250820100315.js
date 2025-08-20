const express = require('express');
const router = express.Router();
const { getAllSpecialties } = require('../../controllers/specialty/specialty.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

/**
 * [GET] /api/specialties
 * Lấy danh sách tất cả chuyên khoa
 * Quyền: public
 */
router.get('/', getAllSpecialties);

/**
 * Nếu cần sau này có thêm CRUD chuyên khoa
 * [POST] /api/specialties     -> Chỉ admin
 * [PUT] /api/specialties/:id  -> Chỉ admin
 * [DELETE] /api/specialties/:id -> Chỉ admin
 * Chỉ cần thêm verifyToken + authorize('admin')
 */

module.exports = router;