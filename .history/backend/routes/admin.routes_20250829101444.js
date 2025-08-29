const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// ================= Users =================
router.get('/users', verifyToken, authorize('admin'), adminController.getAllUsers);
router.post('/users', verifyToken, authorize('admin'), adminController.createUser);
router.put('/users/:id', verifyToken, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, authorize('admin'), adminController.deleteUser);
router.post('/users/:id/reset-password', verifyToken, authorize('admin'), adminController.resetPasswordUser);

// ================= Doctors =================
router.get('/doctors', verifyToken, authorize('admin'), adminController.getAllDoctors);
router.post('/doctors', verifyToken, authorize('admin'), adminController.createDoctor);
router.put('/doctors/:id', verifyToken, authorize('admin'), adminController.updateDoctor);
router.delete('/doctors/:id', verifyToken, authorize('admin'), adminController.deleteDoctor);

// ================= Locations =================
router.get('/locations', verifyToken, authorize('admin'), adminController.getAllLocations);
router.post('/locations', verifyToken, authorize('admin'), adminController.createLocation);
router.put('/locations/:id', verifyToken, authorize('admin'), adminController.updateLocation);
router.delete('/locations/:id', verifyToken, authorize('admin'), adminController.deleteLocation);

// ================= Specialties =================
router.get('/specialties', verifyToken, authorize('admin'), adminController.getAllSpecialties);
router.post('/specialties', verifyToken, authorize('admin'), adminController.createSpecialty);
router.put('/specialties/:id', verifyToken, authorize('admin'), adminController.updateSpecialty);
router.delete('/specialties/:id', verifyToken, authorize('admin'), adminController.deleteSpecialty);

// Update specialties of a location (multi-select)
// router.put('/locations/:id/specialties', verifyToken, verifyAdmin, adminController.updateLocationSpecialties);

module.exports = router;
