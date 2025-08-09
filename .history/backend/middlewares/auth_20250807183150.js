const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Xác thực token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Không có token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gán thông tin user (gồm id, role nếu muốn dùng cho phân quyền)
    req.user = {
      id: decoded.id,
      role: decoded.role, // Giả sử token có lưu role
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

// Middleware: Phân quyền theo nhiều vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

// Middleware: Chỉ cho bác sĩ
const isDoctor = (req, res, next) => {
  if (req.user?.role !== 'doctor') {
    return res.status(403).json({ error: 'Chỉ bác sĩ mới được truy cập' });
  }
  next();
};

module.exports = {
  verifyToken,
  authorize,
  isDoctor,
};
