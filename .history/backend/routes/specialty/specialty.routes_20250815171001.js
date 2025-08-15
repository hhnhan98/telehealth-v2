// routes/specialty/specialty.routes.js
const express = require('express');
const router = express.Router();
const specialtyController = require('../../controllers/specialty/specialty.controller');

/**
 * [GET] /api/specialties
 * Lấy danh sách tất cả chuyên khoa
 * Quyền: public
 */
router.get('/', specialtyController.getAllSpecialties);

module.exports = router;
