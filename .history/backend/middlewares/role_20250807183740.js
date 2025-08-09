// Middleware: Phân quyền theo danh sách vai trò
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

module.exports = { authorize, isDoctor };
