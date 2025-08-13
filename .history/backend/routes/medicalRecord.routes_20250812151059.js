const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

router.post('/', verifyToken, authorize('doctor'), medicalRecordController.createMedicalRecord);
router.get('/', verifyToken, authorize('doctor'), medicalRecordController.getAllMedicalRecords);
router.get('/:id', verifyToken, medicalRecordController.getMedicalRecordById);
router.put('/:id', verifyToken, authorize('doctor'), medicalRecordController.updateMedicalRecord);
router.delete('/:id', verifyToken, authorize('doctor'), medicalRecordController.deleteMedicalRecord);
router.get('/patient/:id', verifyToken, authorize('doctor', 'patient'), medicalRecordController.getMedicalRecordsByPatient);

module.exports = router;
