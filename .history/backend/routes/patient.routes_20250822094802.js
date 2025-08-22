// routes/patient/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');



/* ====== Route cho Admin: đang phát triển ======
// Lấy danh sách tất cả bệnh nhân
router.get('/', verifyToken, authorize('admin', 'doctor'), patientController.getAllPatients);
// Lấy thông tin chi tiết một bệnh nhân theo ID
router.get('/:id', verifyToken, authorize('admin', 'doctor'), patientController.getPatientById);
// Tạo bệnh nhân mới
router.post('/', verifyToken, authorize('admin'), patientController.createPatient);
// Cập nhật thông tin bệnh nhân theo ID
router.put('/:id', verifyToken, authorize('admin'), patientController.updatePatient);
* // [DELETE] /api/patients/:id
* router.delete('/:id', verifyToken, authorize('admin'), patientController.deletePatient);
*/
module.exports = router;
