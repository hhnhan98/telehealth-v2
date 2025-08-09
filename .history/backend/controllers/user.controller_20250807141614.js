const User = require('../models/User');
const Specialty = require('../models/Specialty'); // <== Bổ sung dòng này
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng (lọc theo vai trò và chuyên khoa nếu có)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, specialty } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (specialty) filter.specialty = specialty;

    const users = await User.find(filter)
      .select('-password')
      .populate('specialty', 'name');

    res.json(users);
  } catch (err) {
    res.status(500).json({
      error: 'Không thể lấy danh sách người dùng',
      details: err.message,
    });
  }
};

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('specialty', 'name');

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Lấy hồ sơ của chính mình (dựa vào JWT middleware)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('specialty', 'name');

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Tạo mới người dùng
exports.createUser = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty } = req.body;

    const newUser = new User({ role, fullName, email, password });

    if (role === 'doctor' && specialty) {
      newUser.specialty = specialty;
    }

    await newUser.save();

    const populatedUser = await newUser.populate('specialty', 'name');

    res.status(201).json({
      message: 'Tạo user thành công',
      user: populatedUser,
    });
  } catch (err) {
    res.status(400).json({
      error: 'Tạo user thất bại',
      details: err.message,
    });
  }
};

// Cập nhật người dùng theo ID
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .select('-password')
      .populate('specialty', 'name');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật thành công',
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      error: 'Cập nhật thất bại',
      details: err.message,
    });
  }
};

// Cập nhật thông tin cá nhân của chính mình
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép cập nhật các trường sau
    const disallowedFields = ['email', 'role', 'specialty'];
    for (const field of disallowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== currentUser[field]) {
        return res.status(400).json({ message: `Không thể thay đổi trường: ${field}` });
      }
    }

    // Các trường được phép cập nhật
    const allowedFields = ['fullName', 'phone', 'gender', 'birthYear'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        currentUser[field] = req.body[field];
      }
    }

    // Nếu có cập nhật mật khẩu mới
    if (req.body.password && req.body.password.trim() !== '') {
      const hashed = await bcrypt.hash(req.body.password, 10);
      currentUser.password = hashed;
    }

    await currentUser.save();

    const userWithoutPassword = currentUser.toObject();
    delete userWithoutPassword.password;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật hồ sơ.' });
  }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Đã xoá user' });
  } catch (err) {
    res.status(500).json({
      error: 'Xoá thất bại',
      details: err.message,
    });
  }
};

// ✅ Đã chỉnh sửa: Lấy danh sách bác sĩ theo tên chuyên khoa (nếu có)
exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;

    const filter = { role: 'doctor' };

    if (specialty) {
      const specDoc = await Specialty.findOne({ name: specialty });

      if (!specDoc) {
        return res.status(404).json({ error: 'Không tìm thấy chuyên khoa' });
      }

      filter.specialty = specDoc._id;
    }

    const doctors = await User.find(filter)
      .select('-password')
      .populate('specialty', 'name');

    res.json(doctors);
  } catch (err) {
    res.status(500).json({
      error: 'Không thể lấy danh sách bác sĩ',
      details: err.message,
    });
  }
};