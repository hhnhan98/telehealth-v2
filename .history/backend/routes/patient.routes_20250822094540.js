// routes/patient/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

/**
 * [GET] /api/patients/
 * Lấy danh sách tất cả bệnh nhân
 * Quyền: admin hoặc doctor
 */
router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);

// Lấy thông tin chi tiết một bệnh nhân theo ID
router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);

/**
 * [POST] /api/patients/
 * Tạo bệnh nhân mới
 * Quyền: admin
 */
router.post('/', verifyToken, authorize('admin'), patientController.createPatient);

/**
 * [PUT] /api/patients/:id
 * Cập nhật thông tin bệnh nhân theo ID
 * Quyền: admin
 */
router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);

/**
 * [DELETE] /api/patients/:id
 * Xóa bệnh nhân theo ID
 * Quyền: admin
 */
router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);

module.exports = router;
