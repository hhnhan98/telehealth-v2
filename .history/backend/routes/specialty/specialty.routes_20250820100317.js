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

module.exports = router;