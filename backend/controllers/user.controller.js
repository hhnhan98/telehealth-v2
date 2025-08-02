const User = require('../models/User');

// ✅ Lấy toàn bộ users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách người dùng' });
  }
};

// ✅ Lấy user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ✅ Lấy thông tin chính mình
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ✅ Tạo mới user
exports.createUser = async (req, res) => {
  try {
    const { role, fullName, email, password } = req.body;
    const newUser = new User({ role, fullName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Tạo user thành công', user: newUser });
  } catch (err) {
    res.status(400).json({ error: 'Tạo user thất bại', details: err.message });
  }
};

// ✅ Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: 'Cập nhật thất bại', details: err.message });
  }
};

// ✅ Xoá user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json({ message: 'Đã xoá user' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
};