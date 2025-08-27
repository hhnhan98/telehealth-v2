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

module.exports = { createMedicalRecord };
