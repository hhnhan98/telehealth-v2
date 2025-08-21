// routes/medicalRecord/medicalRecord.routes.js
const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord/medicalRecord.controller');
const { verifyToken } = require('../../middlewares/auth/auth');
const { authorize } = require('../../middlewares/auth/role');

/**
 * [GET] /api/medical-records/patient/:patientId
 * Lấy danh sách hồ sơ bệnh án của một bệnh nhân
 * Quyền: doctor hoặc admin
 */
router.get('/patient/:patientId', verifyToken, authorize('doctor', 'admin'), medicalRecordController.getRecordsByPatient);

/**
 * [POST] /api/medical-records/
 * Tạo hồ sơ bệnh án mới
 * Quyền: doctor
 */
router.post('/', verifyToken, authorize('doctor'), medicalRecordController.createMedicalRecord);

/**
 * [PUT] /api/medical-records/:id
 * Cập nhật hồ sơ bệnh án theo ID
 * Quyền: doctor
 */
router.put('/:id', verifyToken, authorize('doctor'), medicalRecordController.updateMedicalRecord);

/**
 * [DELETE] /api/medical-records/:id
 * Xóa hồ sơ bệnh án theo ID
 * Quyền: admin
 */
router.delete('/:id', verifyToken, authorize('admin'), medicalRecordController.deleteMedicalRecord);

module.exports = router;
