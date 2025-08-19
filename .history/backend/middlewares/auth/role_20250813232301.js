// Middleware: Phân quyền theo danh sách vai trò
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase().trim();
    const allowedRoles = roles.map(r => r.toLowerCase().trim());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

// Middleware: Chỉ cho bác sĩ
const isDoctor = (req, res, next) => {
  if (req.user?.role?.toLowerCase().trim() !== 'doctor') {
    return res.status(403).json({ error: 'Chỉ bác sĩ mới được truy cập' });
  }
  next();
};

module.exports = { authorize, isDoctor };
