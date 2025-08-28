const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { responseSuccess, responseError } = require('../utils/response');

// ================= CREATE =================
// Chỉ bác sĩ mới được tạo hồ sơ bệnh án
const createMedicalRecord = async (req, res) => {
  try {
    const { appointment, patient, symptoms, diagnosis, prescriptions, ...rest } = req.body;

    // Kiểm tra trùng lặp: mỗi appointment chỉ có 1 medical record
    const existing = await MedicalRecord.findOne({ appointment });
    if (existing) {
      return responseError(res, 'Hồ sơ bệnh án cho cuộc hẹn này đã tồn tại', 400);
    }

    // Tìm appointment để xác thực
    const appt = await Appointment.findById(appointment);
    if (!appt) return responseError(res, 'Không tìm thấy cuộc hẹn', 404);

    // Tạo mới medical record
    const newRecord = new MedicalRecord({
      appointment,
      doctor: req.user._id, // doctor từ token
      patient,
      symptoms,
      diagnosis,
      prescriptions,
      ...rest
    });

    await newRecord.save();
    return responseSuccess(res, 'Tạo hồ sơ bệnh án thành công', newRecord);
  } catch (err) {
    console.error(err);
    return responseError(res, 'Lỗi server khi tạo hồ sơ bệnh án', 500);
  }
};

// ================= READ LIST =================
// Bác sĩ xem tất cả hồ sơ do mình tạo
// Admin xem tất cả
// Patient xem tất cả hồ sơ của chính mình
const getMedicalRecords = async (req, res) => {
  try {
    const role = req.user.role.toLowerCase();

    let filter = {};
    if (role === 'doctor') {
      filter.doctor = req.user._id;
    } else if (role === 'patient') {
      filter.patient = req.user._id;
    }

    const records = await MedicalRecord.find(filter)
      .populate('appointment', 'date status')
      .populate('doctor', 'name email')
      .populate('patient', 'name email');

    return responseSuccess(res, 'Lấy danh sách hồ sơ bệnh án thành công', records);
  } catch (err) {
    console.error(err);
    return responseError(res, 'Lỗi server khi lấy danh sách hồ sơ bệnh án', 500);
  }
};

// ================= READ DETAIL =================
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id)
      .populate('appointment', 'date status')
      .populate('doctor', 'name email')
      .populate('patient', 'name email');

    if (!record) return responseError(res, 'Không tìm thấy hồ sơ bệnh án', 404);

    const role = req.user.role.toLowerCase();

    // Nếu là patient thì chỉ được xem hồ sơ của chính mình
    if (role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return responseError(res, 'Bạn không có quyền truy cập hồ sơ này', 403);
    }

    return responseSuccess(res, 'Lấy chi tiết hồ sơ bệnh án thành công', record);
  } catch (err) {
    console.error(err);
    return responseError(res, 'Lỗi server khi lấy chi tiết hồ sơ bệnh án', 500);
  }
};

// ================= UPDATE =================
// Chỉ doctor mới được update hồ sơ do mình tạo
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role.toLowerCase();

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, 'Không tìm thấy hồ sơ bệnh án', 404);

    // Chỉ doctor mới được update, và phải là chính doctor đó
    if (role !== 'doctor' || record.doctor.toString() !== req.user._id.toString()) {
      return responseError(res, 'Bạn không có quyền cập nhật hồ sơ này', 403);
    }

    Object.assign(record, req.body);
    await record.save();

    return responseSuccess(res, 'Cập nhật hồ sơ bệnh án thành công', record);
  } catch (err) {
    console.error(err);
    return responseError(res, 'Lỗi server khi cập nhật hồ sơ bệnh án', 500);
  }
};

// ================= DELETE =================
// Doctor (chính chủ) hoặc Admin mới được xóa
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role.toLowerCase();

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, 'Không tìm thấy hồ sơ bệnh án', 404);

    // Chỉ doctor (chính chủ) hoặc admin mới được xóa
    if (
      !(
        role === 'admin' ||
        (role === 'doctor' && record.doctor.toString() === req.user._id.toString())
      )
    ) {
      return responseError(res, 'Bạn không có quyền xóa hồ sơ này', 403);
    }

    await record.deleteOne();
    return responseSuccess(res, 'Xóa hồ sơ bệnh án thành công');
  } catch (err) {
    console.error(err);
    return responseError(res, 'Lỗi server khi xóa hồ sơ bệnh án', 500);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};
