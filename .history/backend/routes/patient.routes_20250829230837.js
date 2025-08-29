const express = require('express');
const router = express.Router();
const multer = require('multer');
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const medicalRecordController = require('../controllers/medicalRecord.controller');

// ====== Cấu hình Multer cho upload avatar ======
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===== PatientProfile Route ======
router.get('/me', verifyToken, authorize('patient'), patientController.getMyProfile);
router.put('/me', verifyToken, authorize('patient'), upload.single('avatar'), patientController.updateMyProfile); 
router.put('/me/password', verifyToken, patientController.changePassword);
router.get('/me/medical-records', verifyToken, medicalRecordController.getMyMedicalRecords);

\
module.exports = router;
