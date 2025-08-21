const { responseError } = require('../utils/response');

// Middleware: Phân quyền theo danh sách vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase().trim();
    const allowedRoles = roles.map(r => r.toLowerCase().trim());

    if (!allowedRoles.includes(userRole)) {
      return responseError(res, 'Bạn không có quyền truy cập', 403);
    }
    next();
  };
};

// Middleware: Chỉ cho bác sĩ
const isDoctor = (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase().trim();
  if (userRole !== 'doctor') {
    return responseError(res, 'Chỉ bác sĩ mới được truy cập', 403);
  }
  next();
};

module.exports = { authorize, isDoctor };