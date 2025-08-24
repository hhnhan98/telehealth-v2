const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { verifyToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');

// ------------------------- Routes Location -------------------------

// Lấy danh sách tất cả cơ sở y tế
router.get('/', locationController.getAllLocations);

// Tạo cơ sở y tế mới
// router.post(
//   '/',
//   verifyToken,
//   authorize('admin'),
//   locationController.createLocation
// );

module.exports = router;