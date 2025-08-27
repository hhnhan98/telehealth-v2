const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { responseSuccess, responseError } = require('../utils/response');

// Lấy hồ sơ bệnh nhân hiện tại
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio')
      .lean();

    if (!patient) return responseError(res, 'Không tìm thấy hồ sơ bệnh nhân', 404);

    return responseSuccess(res, 'Hồ sơ bệnh nhân', patient);
  } catch (err) {
    console.error('Lỗi getMyProfile:', err);
    return responseError(res, 'Lỗi khi lấy hồ sơ bệnh nhân', 500, err.message);
  }
};

// Cập nhật hồ sơ bệnh nhân
const updateMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return responseError(res, 'Không tìm thấy hồ sơ bệnh nhân', 404);

    const patientFields = ['address', 'bio', 'medicalHistory'];
    patientFields.forEach(f => {
      if (req.body[f] !== undefined) patient[f] = req.body[f];
    });
    await patient.save();

    const userFields = ['fullName', 'birthYear', 'gender', 'phone', 'bio'];
    const user = await User.findById(req.user._id);
    userFields.forEach(f => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const oldPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = avatarPath;
    }

    await user.save();

    const updatedPatient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'fullName email birthYear gender phone avatar bio');

    return responseSuccess(res, 'Cập nhật hồ sơ thành công', updatedPatient);
  } catch (err) {
    console.error('Lỗi updateMyProfile:', err);
    return responseError(res, 'Lỗi khi cập nhật hồ sơ', 400, err.message);
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { current, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return responseError(res, 'Người dùng không tồn tại', 404);

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) return responseError(res, 'Mật khẩu hiện tại không đúng', 400);

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    return responseSuccess(res, 'Đổi mật khẩu thành công');
  } catch (err) {
    console.error('Lỗi changePassword:', err);
    return responseError(res, 'Lỗi khi đổi mật khẩu', 500, err);
  }
};

// Lấy danh sách bệnh nhân do bác sĩ phụ trách
const getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Lấy appointments có trạng thái 'completed'
    const appointments = await Appointment.find({
       doctor: doctorId, 
      //  status: 'completed',
    }).select('patient').lean();

    const patientIds = [...new Set(appointments.map(a => a.patient.toString()))]; // loại trùng

    // Lấy thông tin cơ bản patient + user
    const patients = await Patient.find({ user: { $in: patientIds } })
      .populate('user', 'fullName birthYear address') // chỉ lấy info cơ bản
      .lean();

    // Format dữ liệu để FE hiển thị
    const data = patients.map(p => ({
      _id: p._id,
      fullName: p.user?.fullName || '',
      birthYear: p.user?.birthYear || null,
      address: p.address || '',
    }));

    return responseSuccess(res, 'Danh sách bệnh nhân', data);
  } catch (err) {
    console.error('getMyPatients error:', err);
    return responseError(res, 'Có lỗi xảy ra khi lấy danh sách bệnh nhân', 500);
  }
};

// Lấy danh sách phiếu khám của 1 bệnh nhân
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return responseError(res, 'ID bệnh nhân không hợp lệ', 400);
    }

    // Lấy tất cả medical records của bệnh nhân
    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'fullName specialty location') // bác sĩ
      .populate({
        path: 'appointment',
        select: 'date time specialty location doctor',
        populate: [
          { path: 'specialty', select: 'name' },
          { path: 'location', select: 'name' },
        ],
      })
      .sort({ date: -1 }) // mới -> cũ
      .lean();

    // Format dữ liệu cho FE
    const data = records.map(r => ({
      _id: r._id,
      date: r.date,
      doctorName: r.doctor?.fullName || '',
      specialtyName: r.appointment?.specialty?.name || '',
      locationName: r.appointment?.location?.name || '',
    }));

    return responseSuccess(res, 'Danh sách phiếu khám bệnh', data);
  } catch (err) {
    console.error('getMedicalRecordsByPatient error:', err);
    return responseError(res, 'Có lỗi xảy ra khi lấy lịch sử khám bệnh', 500);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getMyPatients,
  getMedicalRecordsByPatient,
};
