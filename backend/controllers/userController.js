const User = require('../models/User');

// [GET] /api/users - Lấy tất cả users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// [GET] /api/users/:id - Lấy 1 user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// [PUT] /api/users/:id - Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }).select('-password');
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// [DELETE] /api/users/:id - Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};