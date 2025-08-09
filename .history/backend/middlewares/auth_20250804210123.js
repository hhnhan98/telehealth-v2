const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Xác thực token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Không có token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // gán ID

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

// Middleware: Phân quyền theo vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
