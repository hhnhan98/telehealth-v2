const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  getDoctorsBySpecialty,
} = require('../controllers/user.controller');

// Route: Lấy tất cả người dùng (tuỳ chọn, có thể bỏ nếu không dùng)
router.get('/', getAllUsers);

// Route: Lấy thông tin người dùng theo ID
router.get('/:id', getUserById);

// Route: Cập nhật thông tin cá nhân người dùng
router.patch('/:id', updateUserProfile);

// ✅ Route: Lấy danh sách bác sĩ theo chuyên khoa (specialty là ObjectId)
router.get('/doctor/by-specialty', getDoctorsBySpecialty);

module.exports = router;
