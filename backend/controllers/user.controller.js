  const User = require('../models/User');

  // ✅ Lấy toàn bộ users (có thể lọc theo role và specialty)
  exports.getAllUsers = async (req, res) => {
    try {
      const { role, specialty } = req.query;

      const filter = {};
      if (role) filter.role = role;
      if (specialty) filter.specialty = specialty;

      const users = await User.find(filter)
        .select('-password')
        .populate('specialty', 'name'); // chỉ lấy tên chuyên khoa

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Không thể lấy danh sách người dùng', details: err.message });
    }
  };

  // ✅ Lấy user theo ID
  exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password')
        .populate('specialty', 'name');

      if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server', details: err.message });
    }
  };

  // ✅ Lấy thông tin chính mình
  exports.getMyProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('specialty', 'name');

      if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server', details: err.message });
    }
  };

  // ✅ Tạo mới user
  exports.createUser = async (req, res) => {
    try {
      const { role, fullName, email, password, specialty } = req.body;

      const newUser = new User({ role, fullName, email, password });

      if (role === 'doctor' && specialty) {
        newUser.specialty = specialty;
      }

      await newUser.save();

      const populatedUser = await newUser.populate('specialty', 'name');

      res.status(201).json({ message: 'Tạo user thành công', user: populatedUser });
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
      ).select('-password').populate('specialty', 'name');

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

  // ✅ Lấy danh sách bác sĩ theo chuyên khoa
  exports.getDoctorsBySpecialty = async (req, res) => {
    try {
      const { specialty } = req.query;

      const filter = { role: 'doctor' };
      if (specialty) filter.specialty = specialty;

      const doctors = await User.find(filter)
        .select('-password')
        .populate('specialty', 'name');

      res.json(doctors);
    } catch (err) {
      res.status(500).json({ error: 'Không thể lấy danh sách bác sĩ', details: err.message });
    }
  };