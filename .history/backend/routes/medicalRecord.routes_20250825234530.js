const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { createMedicalRecord } = require('../controllers/medicalRecord.controller');

// Tạo phiếu khám bệnh (MedicalRecord)
router.post('/', verifyToken, createMedicalRecord);

module.exports = router;
