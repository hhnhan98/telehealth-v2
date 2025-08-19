const User = require('../../models/User');
const Specialty = require('../../models/Specialty');
const bcrypt = require('bcryptjs');
const { responseSuccess, responseError } = require('../../utils/response');

// ----------------------- Helper -----------------------
const hashPassword = async (password) => bcrypt.hash(password, 10);

const resolveSpecialty = async (specialty) => {
  if (!specialty) return null;
  const isValidId = /^[0-9a-fA-F]{24}$/.test(specialty);
  if (isValidId) return specialty;
  const specDoc = await Specialty.findOne({ name: specialty });
  if (!specDoc) throw new Error('Chuyên khoa không tồn tại');
  return specDoc._id;
};

// ----------------------- CRUD APIs -----------------------
exports.getAllUsers = async (req, res) => {
  try {
    const { role, specialty } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (specialty) filter.specialty = await resolveSpecialty(specialty);

    const users = await User.find(filter)
      .select('-password')
      .populate('specialty', 'name');

    return success(res, 'Danh sách người dùng', { users });
  } catch (err) {
    return error(res, err.message || 'Không thể lấy danh sách người dùng', 500);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('specialty', 'name');

    if (!user) return error(res, 'Không tìm thấy người dùng', 404);
    return success(res, 'Thông tin người dùng', { user });
  } catch (err) {
    return error(res, err.message || 'Lỗi server', 500);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return responseError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('specialty', 'name');

    if (!user) {
      return responseError(res, 'Không tìm thấy người dùng', 404);
    }

    return responseSuccess(res, 'Hồ sơ cá nhân', { user });
  } catch (err) {
    return responseError(res, err.message || 'Lỗi server', 500);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { role, fullName, email, password, specialty } = req.body;

    if (await User.findOne({ email })) {
      return error(res, 'Email đã tồn tại', 400);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ role, fullName, email, password: hashedPassword });

    if (role === 'doctor') {
      newUser.specialty = await resolveSpecialty(specialty);
    }

    await newUser.save();
    await newUser.populate('specialty', 'name');

    return success(res, 'Tạo user thành công', { user: newUser }, 201);
  } catch (err) {
    return error(res, err.message || 'Tạo user thất bại', 400);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { specialty, password, ...rest } = req.body;
    const updateData = { ...rest };

    if (specialty) updateData.specialty = await resolveSpecialty(specialty);
    if (password) updateData.password = await hashPassword(password);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('specialty', 'name');

    if (!updatedUser) return error(res, 'Không tìm thấy người dùng', 404);
    return success(res, 'Cập nhật thành công', { user: updatedUser });
  } catch (err) {
    return error(res, err.message || 'Cập nhật thất bại', 400);
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 'Người dùng không tồn tại', 404);

    const allowedFields = ['fullName', 'phone', 'gender', 'birthYear'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== '') user[field] = req.body[field];
    });

    if (req.body.password && req.body.password.trim() !== '') {
      user.password = await hashPassword(req.body.password);
    }

    await user.save();
    return success(res, 'Cập nhật hồ sơ thành công', { user: user.toJSON() });
  } catch (err) {
    return error(res, err.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ', 500);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return error(res, 'Không tìm thấy người dùng', 404);
    return success(res, 'Đã xoá user', { userId: deletedUser._id });
  } catch (err) {
    return error(res, err.message || 'Xoá thất bại', 500);
  }
};

exports.getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = { role: 'doctor' };
    if (specialty) filter.specialty = await resolveSpecialty(specialty);

    const doctors = await User.find(filter)
      .select('fullName _id specialty')
      .populate('specialty', 'name');

    return success(res, 'Danh sách bác sĩ', { doctors });
  } catch (err) {
    return error(res, err.message || 'Không thể lấy danh sách bác sĩ', 500);
  }
};

// const User = require('../../models/User');
  // const Specialty = require('../../models/Specialty');
  // const bcrypt = require('bcryptjs');

  // // Lấy danh sách người dùng (lọc theo vai trò và chuyên khoa nếu có)
  // exports.getAllUsers = async (req, res) => {
  //   try {
  //     const { role, specialty } = req.query;
  //     const filter = {};

  //     if (role) filter.role = role;

  //     if (specialty) {
  //       const isValidId = specialty.match(/^[0-9a-fA-F]{24}$/);
  //       if (isValidId) {
  //         filter.specialty = specialty;
  //       } else {
  //         const specDoc = await Specialty.findOne({ name: specialty });
  //         if (!specDoc) {
  //           return res.status(404).json({ error: 'Không tìm thấy chuyên khoa' });
  //         }
  //         filter.specialty = specDoc._id;
  //       }
  //     }

  //     const users = await User.find(filter)
  //       .select('-password')
  //       .populate('specialty', 'name');

  //     res.json(users);
  //   } catch (err) {
  //     res.status(500).json({
  //       error: 'Không thể lấy danh sách người dùng',
  //       details: err.message,
  //     });
  //   }
  // };

  // // Lấy thông tin người dùng theo ID
  // exports.getUserById = async (req, res) => {
  //   try {
  //     const user = await User.findById(req.params.id)
  //       .select('-password')
  //       .populate('specialty', 'name');

  //     if (!user) {
  //       return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  //     }

  //     res.json(user);
  //   } catch (err) {
  //     res.status(500).json({ error: 'Lỗi server', details: err.message });
  //   }
  // };

  // // Lấy hồ sơ của người dùng hiện tại
  // exports.getMyProfile = async (req, res) => {
  //   try {
  //     if (!req.user || !req.user._id) {
  //       return res.status(401).json({ error: 'Token không hợp lệ hoặc hết hạn' });
  //     }

  //     const user = await User.findById(req.user._id)
  //       .select('-password')
  //       .populate('specialty', 'name');

  //     if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

  //     res.json(user);
  //   } catch (err) {
  //     console.error('Lỗi khi getMyProfile:', err);
  //     res.status(500).json({ error: 'Lỗi server', details: err.message });
  //   }
  // };



  // // Tạo người dùng mới
  // exports.createUser = async (req, res) => {
  //   try {
  //     const { role, fullName, email, password, specialty } = req.body;

  //     const existing = await User.findOne({ email });
  //     if (existing) {
  //       return res.status(400).json({ error: 'Email đã tồn tại' });
  //     }

  //     const hashed = await bcrypt.hash(password, 10);
  //     const newUser = new User({ role, fullName, email, password: hashed });

  //     if (role === 'doctor') {
  //       if (!specialty) {
  //         return res.status(400).json({ error: 'Bác sĩ phải có chuyên khoa' });
  //       }

  //       const isValidId = specialty.match(/^[0-9a-fA-F]{24}$/);
  //       let specDoc;

  //       if (isValidId) {
  //         specDoc = await Specialty.findById(specialty);
  //       } else {
  //         specDoc = await Specialty.findOne({ name: specialty });
  //       }

  //       if (!specDoc) {
  //         return res.status(400).json({ error: 'Chuyên khoa không hợp lệ' });
  //       }

  //       newUser.specialty = specDoc._id;
  //     }

  //     await newUser.save();

  //     const populatedUser = await newUser.populate('specialty', 'name');

  //     res.status(201).json({
  //       message: 'Tạo user thành công',
  //       user: populatedUser,
  //     });
  //   } catch (err) {
  //     res.status(400).json({
  //       error: 'Tạo user thất bại',
  //       details: err.message,
  //     });
  //   }
  // };

  // // Cập nhật người dùng theo ID
  // exports.updateUser = async (req, res) => {
  //   try {
  //     const { specialty, password, ...rest } = req.body;
  //     const updateData = { ...rest };

  //     if (specialty) {
  //       const isValidId = specialty.match(/^[0-9a-fA-F]{24}$/);
  //       let specDoc;

  //       if (isValidId) {
  //         specDoc = await Specialty.findById(specialty);
  //       } else {
  //         specDoc = await Specialty.findOne({ name: specialty });
  //       }

  //       if (!specDoc) {
  //         return res.status(400).json({ error: 'Chuyên khoa không hợp lệ' });
  //       }

  //       updateData.specialty = specDoc._id;
  //     }

  //     if (password && password.trim() !== '') {
  //       updateData.password = await bcrypt.hash(password, 10);
  //     }

  //     const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
  //       new: true,
  //       runValidators: true,
  //     })
  //       .select('-password')
  //       .populate('specialty', 'name');

  //     if (!updatedUser) {
  //       return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  //     }

  //     res.json({
  //       message: 'Cập nhật thành công',
  //       user: updatedUser,
  //     });
  //   } catch (err) {
  //     res.status(400).json({
  //       error: 'Cập nhật thất bại',
  //       details: err.message,
  //     });
  //   }
  // };

  // // Cập nhật hồ sơ cá nhân (của user hiện tại)
  // exports.updateMyProfile = async (req, res) => {
  //   try {
  //     const user = await User.findById(req.user._id);
  //     if (!user) {
  //       return res.status(404).json({ message: 'Người dùng không tồn tại' });
  //     }

  //     // Chỉ cho phép update những trường này
  //     const allowedFields = ['fullName', 'phone', 'gender', 'birthYear'];
  //     allowedFields.forEach(field => {
  //       if (req.body[field] !== undefined && req.body[field] !== '') {
  //         user[field] = req.body[field];
  //       }
  //     });

  //     // Cập nhật mật khẩu nếu có
  //     if (req.body.password && req.body.password.trim() !== '') {
  //       user.password = await bcrypt.hash(req.body.password, 10);
  //     }

  //     await user.save();

  //     // Trả về user đã cập nhật (không có password)
  //     const userWithoutPassword = user.toObject();
  //     delete userWithoutPassword.password;
  //     res.status(200).json(userWithoutPassword);
  //   } catch (err) {
  //     console.error('Lỗi khi updateMyProfile:', err);
  //     res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật hồ sơ.', details: err.message });
  //   }
  // };


  // // Xoá người dùng theo ID
  // exports.deleteUser = async (req, res) => {
  //   try {
  //     const deletedUser = await User.findByIdAndDelete(req.params.id);
  //     if (!deletedUser) {
  //       return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  //     }

  //     res.json({ message: 'Đã xoá user' });
  //   } catch (err) {
  //     res.status(500).json({
  //       error: 'Xoá thất bại',
  //       details: err.message,
  //     });
  //   }
  // };

  // // Lấy danh sách bác sĩ theo chuyên khoa (dùng ObjectId là chính)
  // exports.getDoctorsBySpecialty = async (req, res) => {
  //   try {
  //     const { specialty } = req.query;
  //     const filter = { role: 'doctor' };

  //     if (specialty) {
  //       const isValidId = /^[0-9a-fA-F]{24}$/.test(specialty);
  //       if (isValidId) {
  //         filter.specialty = specialty;
  //       } else {
  //         const specDoc = await Specialty.findOne({ name: specialty });
  //         if (!specDoc) {
  //           return res.status(404).json({ error: 'Không tìm thấy chuyên khoa' });
  //         }
  //         filter.specialty = specDoc._id;
  //       }
  //     }

  //     const doctors = await User.find(filter)
  //       .select('fullName _id specialty') // chỉ trả về field cần thiết
  //       .populate('specialty', 'name');

  //     res.json(doctors);
  //   } catch (err) {
  //     console.error('Lỗi getDoctorsBySpecialty:', err); // Gợi ý thêm log
  //     res.status(500).json({
  //       error: 'Không thể lấy danh sách bác sĩ',
  //       details: err.message,
  //     });
  //   }
  // };
