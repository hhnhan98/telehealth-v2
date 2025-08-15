const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/role');

// Các route có phân quyền: admin và doctor được phép xem, admin được thêm, sửa, xóa
router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);
router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);
router.post('/', verifyToken, authorize('admin'), patientController.createPatient);
router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);
router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);

module.exports = router;
