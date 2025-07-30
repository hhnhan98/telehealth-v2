const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authenticateJWT');

// Route chỉ cho người dùng đã đăng nhập
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Truy cập thành công',
    user: req.user, // Trả lại thông tin giải mã từ token
  });
});

module.exports = router;
