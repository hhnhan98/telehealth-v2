const mongoose = require("mongoose");
const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appointment");
const { responseSuccess, responseError } = require("../utils/response");

// helper validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * ================= CREATE =================
 * Bác sĩ tạo hồ sơ bệnh án sau khi khám xong
 */
const createMedicalRecord = async (req, res) => {
  try {
    console.log(">>> createMedicalRecord called, req.user:", req.user);
    console.log(">>> Incoming payload:", req.body);

    const { appointment, patient, symptoms, diagnosis, prescriptions, ...rest } = req.body;

    // validate appointment id
    if (!appointment || !isValidObjectId(appointment)) {
      console.warn(">>> Invalid appointment id:", appointment);
      return responseError(res, "appointment id không hợp lệ", 400);
    }

    // check appointment tồn tại
    const appt = await Appointment.findById(appointment);
    console.log(">>> Appointment fetched:", appt);
    if (!appt) return responseError(res, "Không tìm thấy cuộc hẹn", 404);

    // mỗi appointment chỉ được có 1 record
    const existing = await MedicalRecord.findOne({ appointment });
    console.log(">>> Existing medical record:", existing);
    if (existing) return responseError(res, "Hồ sơ bệnh án cho cuộc hẹn này đã tồn tại", 400);

    // lấy patient từ appointment nếu không truyền
    const patientId = patient || appt.patient;
    if (!isValidObjectId(patientId)) {
      console.warn(">>> Invalid patient id:", patientId);
      return responseError(res, "patient id không hợp lệ", 400);
    }

    // parse numeric fields
    const parsedRest = { ...rest };
    if (parsedRest.height) parsedRest.height = Number(parsedRest.height);
    if (parsedRest.weight) parsedRest.weight = Number(parsedRest.weight);
    if (parsedRest.bmi) parsedRest.bmi = Number(parsedRest.bmi);

    // log prescriptions
    console.log(">>> Prescriptions:", prescriptions);

    // tạo mới record
const newRecord = new MedicalRecord({
  appointment: req.body.appointment,
  doctor: req.user._id,
  patient: req.body.patient,
  doctorSnapshot: { specialty: '', location: '' },
  patientSnapshot: { address: '', phone: '' },
  height: req.body.height,
  weight: req.body.weight,
  ...
});

    console.log(">>> New MedicalRecord instance:", newRecord);

    await newRecord.save();
    console.log(">>> MedicalRecord saved successfully");

    // cập nhật appointment thành "completed"
    appt.status = "completed";
    await appt.save();
    console.log(">>> Appointment updated to completed");

    return responseSuccess(res, "Tạo hồ sơ bệnh án thành công", newRecord);
  } catch (err) {
    console.error(">>> createMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi tạo hồ sơ bệnh án", 500, err);
  }
};

/**
 * ================= READ LIST =================
 */
const getMedicalRecords = async (req, res) => {
  try {
    console.log(">>> getMedicalRecords called, req.user:", req.user);

    const role = (req.user.role || "").toLowerCase();
    const filter = {};

    if (role === "doctor") filter.doctor = req.user._id;
    else if (role === "patient") filter.patient = req.user._id;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .populate("doctor", "fullName")
      .populate("patient", "fullName birthYear address phone")
      .populate("appointment", "date time status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(">>> Records fetched:", records.length);
    return responseSuccess(res, "Danh sách hồ sơ bệnh án", { total, page, limit, records });
  } catch (err) {
    console.error(">>> getMedicalRecords error:", err);
    return responseError(res, "Lỗi server khi lấy danh sách hồ sơ bệnh án", 500, err);
  }
};

/**
 * ================= READ BY PATIENT ID =================
 */
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(">>> getMedicalRecordsByPatient called for patientId:", patientId);

    if (!patientId || !isValidObjectId(patientId)) {
      return responseError(res, "ID bệnh nhân không hợp lệ", 400);
    }

    const role = (req.user.role || "").toLowerCase();
    if (role === "patient" && req.user._id.toString() !== patientId.toString()) {
      return responseError(res, "Bạn không có quyền truy cập hồ sơ của bệnh nhân khác", 403);
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const filter = { patient: patientId };
    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .populate("doctor", "fullName")
      .populate("patient", "fullName birthYear address phone")
      .populate("appointment", "date time status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(">>> Records fetched by patient:", records.length);
    return responseSuccess(res, "Danh sách hồ sơ bệnh án của bệnh nhân", { total, page, limit, records });
  } catch (err) {
    console.error(">>> getMedicalRecordsByPatient error:", err);
    return responseError(res, "Lỗi server khi lấy hồ sơ bệnh án theo bệnh nhân", 500, err);
  }
};

/**
 * ================= READ DETAIL =================
 */
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(">>> getMedicalRecordById called, id:", id);

    if (!id || !isValidObjectId(id)) {
      return responseError(res, "ID không hợp lệ", 400);
    }

    const record = await MedicalRecord.findById(id)
      .populate("doctor", "fullName")
      .populate("patient", "fullName birthYear address phone")
      .populate("appointment", "date time status")
      .lean();

    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);
    console.log(">>> Record found:", record);

    const role = (req.user.role || "").toLowerCase();
    if (role === "patient" && record.patient._id.toString() !== req.user._id.toString()) {
      return responseError(res, "Bạn không có quyền truy cập hồ sơ này", 403);
    }

    return responseSuccess(res, "Chi tiết hồ sơ bệnh án", record);
  } catch (err) {
    console.error(">>> getMedicalRecordById error:", err);
    return responseError(res, "Lỗi server khi lấy chi tiết hồ sơ bệnh án", 500, err);
  }
};

/**
 * ================= UPDATE =================
 */
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(">>> updateMedicalRecord called, id:", id, "payload:", req.body);

    if (!id || !isValidObjectId(id)) return responseError(res, "ID không hợp lệ", 400);

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);

    const role = (req.user.role || "").toLowerCase();
    if (role !== "doctor" || record.doctor.toString() !== req.user._id.toString()) {
      return responseError(res, "Bạn không có quyền cập nhật hồ sơ này", 403);
    }

    const allowed = [
      "height", "weight", "bp", "pulse", "bmi",
      "symptoms", "diagnosis", "notes",
      "prescriptions", "conclusion", "careAdvice"
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) record[field] = req.body[field];
    });

    await record.save();
    console.log(">>> Record updated successfully");
    return responseSuccess(res, "Cập nhật hồ sơ bệnh án thành công", record);
  } catch (err) {
    console.error(">>> updateMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi cập nhật hồ sơ bệnh án", 500, err);
  }
};

/**
 * ================= DELETE =================
 */
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(">>> deleteMedicalRecord called, id:", id);

    if (!id || !isValidObjectId(id)) return responseError(res, "ID không hợp lệ", 400);

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);

    const role = (req.user.role || "").toLowerCase();
    if (!(role === "admin" || (role === "doctor" && record.doctor.toString() === req.user._id.toString()))) {
      return responseError(res, "Bạn không có quyền xóa hồ sơ này", 403);
    }

    await record.deleteOne();
    console.log(">>> Record deleted successfully");
    return responseSuccess(res, "Xóa hồ sơ bệnh án thành công");
  } catch (err) {
    console.error(">>> deleteMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi xóa hồ sơ bệnh án", 500, err);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
};
