const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Specialty = require('../models/Specialty');
const Patient = require('../models/Patient');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];

// ================= Helper =================
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// ================= Users CRUD =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const doctorIds = users.filter(u => u.role === 'doctor').map(u => u._id);

    const doctors = await Doctor.find({ user: { $in: doctorIds } })
      .populate('user', 'fullName email avatar phone birthYear role')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .lean();

    const usersWithDoctorInfo = users.map(u => {
      if (u.role !== 'doctor') return u;
      const doctorInfo = doctors.find(d => d.user?._id.toString() === u._id.toString()) || null;
      return { ...u, doctorInfo };
    });

    res.status(200).json({ success: true, data: usersWithDoctorInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fullName, email, password, role, phone, gender, specialty, location } = req.body;

    if (role === 'doctor' && (!specialty || !location))
      throw new Error('Bác sĩ phải chọn chuyên khoa và cơ sở y tế');

    const hashed = await hashPassword(password || '123456');
    const [newUser] = await User.create([{ fullName, email, password: hashed, role, phone, gender }], { session });

    let populatedDoctor = null;
    if (role === 'doctor') {
      const [doctor] = await Doctor.create([{ user: newUser._id, specialty, location }], { session });
      populatedDoctor = await Doctor.findById(doctor._id)
        .populate('specialty', 'name')
        .populate('location', 'name')
        .lean();
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: { user: newUser, doctor: populatedDoctor } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.password) update.password = await hashPassword(update.password);

    const user = await User.findByIdAndUpdate(id, update, { new: true, session }).select('-password');
    if (!user) throw new Error('User không tồn tại');

    if (user.role === 'doctor' && (update.specialty || update.location)) {
      const doctor = await Doctor.findOne({ user: id }).session(session);
      if (doctor) {
        if (update.specialty && doctor.specialty?.toString() !== update.specialty)
          doctor.specialty = update.specialty;
        if (update.location && doctor.location?.toString() !== update.location)
          doctor.location = update.location;
        await doctor.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const user = await User.findById(id).session(session);
    if (!user) throw new Error('User không tồn tại');

    if (user.role === 'doctor') {
      await Doctor.deleteOne({ user: id }).session(session);
    }

    await User.findByIdAndDelete(id, { session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPasswordUser = async (req, res) => {
  try {
    const { id } = req.params;
    const hashed = await hashPassword('123456');
    await User.findByIdAndUpdate(id, { password: hashed });
    res.status(200).json({ success: true, message: 'Reset mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server khi reset mật khẩu' });
  }
};

// ================= Locations CRUD =================
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    const exist = await Location.findOne({ name });
    if (exist) return res.status(400).json({ success: false, message: 'Tên cơ sở đã tồn tại' });

    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Location.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const doctors = await Doctor.find({ location: id });
    if (doctors.length > 0)
      return res.status(400).json({ success: false, message: 'Không thể xóa location đang có bác sĩ' });
    
    await Specialty.deleteMany({ location: id });    // Xóa specialty thuộc location
    await Location.findByIdAndDelete(id);    // Xóa location

    res.status(200).json({ success: true, message: 'Xóa location thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ================= Specialties CRUD =================
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().populate('location', 'name');
    res.status(200).json({ success: true, data: specialties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createSpecialty = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!location) return res.status(400).json({ success: false, message: 'Specialty phải có location' });

    const exist = await Specialty.findOne({ name, location });
    if (exist) return res.status(400).json({ success: false, message: 'Specialty đã tồn tại trong cơ sở này' });

    const specialty = await Specialty.create(req.body);
    const populated = await specialty.populate('location', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    if (name && location) {
      const exist = await Specialty.findOne({ _id: { $ne: id }, name, location });
      if (exist) return res.status(400).json({ success: false, message: 'Specialty đã tồn tại trong cơ sở này' });
    }

    const updated = await Specialty.findByIdAndUpdate(id, req.body, { new: true }).populate('location', 'name');
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const doctors = await Doctor.find({ specialty: id });
    if (doctors.length > 0)
      return res.status(400).json({ success: false, message: 'Không thể xóa specialty đang có bác sĩ' });

    await Specialty.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa specialty thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ================= Doctors CRUD =================
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'fullName email avatar phone birthYear role')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .lean();
    res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.createDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fullName, email, password, phone, gender, specialty, location } = req.body;

    if (!specialty || !location)
      throw new Error('Bác sĩ phải chọn chuyên khoa và cơ sở y tế');

    const [newUser] = await User.create([{ fullName, email, password: await hashPassword(password || '123456'), role: 'doctor', phone, gender }], { session });
    const [doctor] = await Doctor.create([{ user: newUser._id, specialty, location }], { session });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'fullName email avatar phone birthYear role')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .lean();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: populatedDoctor });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { specialty, location, fullName, phone, gender, email } = req.body;

    const doctor = await Doctor.findById(id).session(session);
    if (!doctor) throw new Error('Doctor không tồn tại');

    // Update specialty & location
    if (specialty) doctor.specialty = specialty;
    if (location) doctor.location = location;
    await doctor.save({ session });

    // Update User info
    const userUpdate = {};
    if (fullName) userUpdate.fullName = fullName;
    if (phone) userUpdate.phone = phone;
    if (gender) userUpdate.gender = gender;
    if (email) userUpdate.email = email;

    if (Object.keys(userUpdate).length > 0)
      await User.findByIdAndUpdate(doctor.user, userUpdate, { new: true, session });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'fullName email avatar phone birthYear role')
      .populate('specialty', 'name')
      .populate('location', 'name')
      .lean();

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: populatedDoctor });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).session(session);
    if (!doctor) throw new Error('Doctor không tồn tại');

    await Doctor.findByIdAndDelete(id, { session });
    await User.findByIdAndDelete(doctor.user, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Xóa doctor thành công' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/specialties?location=LOCATION_ID
exports.getSpecialties = async (req, res) => {
  try {
    const { location } = req.query;
    const filter = location ? { location } : {};
    const specialties = await Specialty.find(filter).populate('location', 'name');
    res.status(200).json({ success: true, data: specialties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    // Tổng số lượng
    const [
      totalLocations,
      totalSpecialties,
      totalDoctors,
      totalPatients,
      totalSchedules,
      totalAppointments,
      totalMedicalRecords
    ] = await Promise.all([
      Location.countDocuments(),
      Specialty.countDocuments(),
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Schedule.countDocuments(),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments()
    ]);

    // Số lượng appointments theo trạng thái
    const appointmentStatusCountsRaw = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const appointmentStatusCounts = {};
    APPOINTMENT_STATUSES.forEach(status => appointmentStatusCounts[status] = 0);
    appointmentStatusCountsRaw.forEach(item => {
      appointmentStatusCounts[item._id] = item.count;
    });

    // Số lượng appointments theo từng bác sĩ
    const doctorBookingCountsRaw = await Appointment.aggregate([
      { $group: { _id: "$doctor", count: { $sum: 1 } } }
    ]);

    // Chuyển thành object { doctorId: count }
    const doctorBookingCounts = {};
    doctorBookingCountsRaw.forEach(item => {
      doctorBookingCounts[item._id] = item.count;
    });

    // Trả về dữ liệu đầy đủ
    res.status(200).json({
      success: true,
      data: {
        locations: totalLocations,
        specialties: totalSpecialties,
        doctors: totalDoctors,
        patients: totalPatients,
        schedules: totalSchedules,
        appointments: totalAppointments,
        medicalRecords: totalMedicalRecords,
        appointmentStatusCounts,
        doctorBookingCounts
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
