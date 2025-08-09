const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Người dùng chưa xác thực' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này' });
    }

    next();
  };
};

module.exports = { checkRole };