const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth/auth');
const authorizeRole = require('../middlewares/auth/authorizeRole');
const adminController = require('../controllers/admin.controller');

// Users
router.get('/users', verifyToken, authorizeRole('admin'), adminController.getAllUsers);
router.post('/users', verifyToken, authorizeRole('admin'), adminController.createUser);
router.put('/users/:id', verifyToken, authorizeRole('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, authorizeRole('admin'), adminController.deleteUser);

// Locations
router.get('/locations', verifyToken, authorizeRole('admin'), adminController.getAllLocations);
router.post('/locations', verifyToken, authorizeRole('admin'), adminController.createLocation);
router.put('/locations/:id', verifyToken, authorizeRole('admin'), adminController.updateLocation);
router.delete('/locations/:id', verifyToken, authorizeRole('admin'), adminController.deleteLocation);

// Specialties
router.get('/specialties', verifyToken, authorizeRole('admin'), adminController.getAllSpecialties);
router.post('/specialties', verifyToken, authorizeRole('admin'), adminController.createSpecialty);
router.put('/specialties/:id', verifyToken, authorizeRole('admin'), adminController.updateSpecialty);
router.delete('/specialties/:id', verifyToken, authorizeRole('admin'), adminController.deleteSpecialty);

module.exports = router;
