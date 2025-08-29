// ===== UserController - Backend core logic =====

// Tạo user (Patient / Doctor / Admin)
exports.createUser = async (req, res) => {
  const { role, fullName, email, password, specialty, location } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!role || !fullName || !email || !password) 
    return res.status(400).send('Thiếu thông tin');

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ role, fullName, email, password: hashedPassword });

  // Nếu là bác sĩ, tạo profile liên kết với Specialty & Location
  if (role === 'doctor') {
    const specialtyId = await resolveSpecialty(specialty);
    await Doctor.create({
      user: newUser._id,
      fullName,
      specialty: specialtyId,
      location
    });
  }

  return res.status(201).json({ user: newUser });
};

// Lấy hồ sơ cá nhân
exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  // Nếu là bác sĩ, trả thêm doctorProfile
  let doctorProfile = null;
  if (user.role === 'doctor') {
    doctorProfile = await Doctor.findOne({ user: user._id })
      .populate('specialty', 'name')
      .populate('location', 'name');
  }

  return res.json({ user, doctorProfile });
};

// Lấy danh sách bác sĩ theo chuyên khoa
exports.getDoctorsBySpecialty = async (req, res) => {
  const { specialty } = req.query;
  const filter = specialty ? { specialty: await resolveSpecialty(specialty) } : {};

  const doctors = await Doctor.find(filter)
    .populate('user', 'fullName avatar email')
    .populate('specialty', 'name')
    .populate('location', 'name');

  return res.json({ doctors });
};
