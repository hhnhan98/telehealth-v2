// routes/admin.routes.js
const express = require('express');
const router = express.Router();

// Import middleware đúng đường dẫn
const { verifyToken, authorize } = require('../../middlewares/auth/auth'); // sửa đường dẫn
const adminController = require('../');

// -------------------- Users --------------------
router.get('/users', verifyToken, authorize('admin'), adminController.getAllUsers);
router.post('/users', verifyToken, authorize('admin'), adminController.createUser);
router.put('/users/:id', verifyToken, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, authorize('admin'), adminController.deleteUser);

// -------------------- Locations --------------------
router.get('/locations', verifyToken, authorize('admin'), adminController.getAllLocations);
router.post('/locations', verifyToken, authorize('admin'), adminController.createLocation);
router.put('/locations/:id', verifyToken, authorize('admin'), adminController.updateLocation);
router.delete('/locations/:id', verifyToken, authorize('admin'), adminController.deleteLocation);

// -------------------- Specialties --------------------
router.get('/specialties', verifyToken, authorize('admin'), adminController.getAllSpecialties);
router.post('/specialties', verifyToken, authorize('admin'), adminController.createSpecialty);
router.put('/specialties/:id', verifyToken, authorize('admin'), adminController.updateSpecialty);
router.delete('/specialties/:id', verifyToken, authorize('admin'), adminController.deleteSpecialty);

module.exports = router;
