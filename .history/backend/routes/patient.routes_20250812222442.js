const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// Lấy danh sách bệnh nhân (chỉ admin & bác sĩ)
router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);

// Lấy thông tin 1 bệnh nhân theo ID (chỉ admin & bác sĩ)
router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);

// Thêm bệnh nhân mới (chỉ admin)
router.post('/', verifyToken, authorize('admin'), patientController.createPatient);

// Cập nhật bệnh nhân (chỉ admin)
router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);

// Xóa bệnh nhân (chỉ admin)
router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);

module.exports = router;
