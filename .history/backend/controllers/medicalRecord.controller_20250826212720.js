const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const { responseError, responseSuccess } = require('../utils/response');

const createMedicalRecord = async (req, res) => {
  try {
    const { appointmentId, symptoms, diagnosis, notes, prescriptions } = req.body;
    const doctorId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return responseError(res, 'Appointment không tồn tại', 404);
    if (appointment.status === 'completed') return responseError(res, 'Cuộc hẹn đã hoàn tất', 400);

    // Tạo MedicalRecord
    const record = await MedicalRecord.create({
      appointment: appointmentId,
      doctor: doctorId,
      patient: appointment.patient,
      symptoms,
      diagnosis,
      notes,
      prescriptions,
    });

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    return responseSuccess(res, 'Medical record created', record);
  } catch (err) {
    console.error('createMedicalRecord error:', err);
    return responseError(res, 'Có lỗi xảy ra', 500);
  }
};

const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient', 'fullName dob gender phone email')
      .populate('doctor', 'fullName')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    return responseSuccess(res, 'Danh sách phiếu khám', records);
  } catch (err) {
    console.error('getMedicalRecords error:', err);
    return responseError(res, 'Có lỗi xảy ra', 500);
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id)
      .populate('patient', 'fullName dob gender phone email address')
      .populate('doctor', 'fullName')
      .populate('appointment', 'date time');

    if (!record) return responseError(res, 'Không tìm thấy phiếu khám', 404);

    return responseSuccess(res, 'Chi tiết phiếu khám', record);
  } catch (err) {
    console.error('getMedicalRecordById error:', err);
    return responseError(res, 'Có lỗi xảy ra', 500);
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await MedicalRecord.findByIdAndUpdate(id, updates, { new: true });

    if (!record) return responseError(res, 'Không tìm thấy phiếu khám', 404);

    return responseSuccess(res, 'Cập nhật phiếu khám thành công', record);
  } catch (err) {
    console.error('updateMedicalRecord error:', err);
    return responseError(res, 'Có lỗi xảy ra', 500);
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findByIdAndDelete(id);
    if (!record) return responseError(res, 'Không tìm thấy phiếu khám', 404);

    return responseSuccess(res, 'Xoá phiếu khám thành công');
  } catch (err) {
    console.error('deleteMedicalRecord error:', err);
    return responseError(res, 'Có lỗi xảy ra', 500);
  }
};

module.exports = { createMedicalRecord };
