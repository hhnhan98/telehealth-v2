// controllers/medicalRecord.controller.js
const mongoose = require("mongoose");
const MedicalRecord = require("../models/MedicalRecord");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const { responseSuccess, responseError } = require("../utils/response");

// helper validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Bác sĩ tạo hồ sơ bệnh án sau khi khám xong
const createMedicalRecord = async (req, res) => {
  try {
    const { appointment, patient, symptoms, diagnosis, prescriptions, ...rest } = req.body;

    // validate appointment id
    if (!appointment || !isValidObjectId(appointment)) {
      return responseError(res, "appointment id không hợp lệ", 400);
    }

    // check appointment tồn tại
    const appt = await Appointment.findById(appointment);
    if (!appt) return responseError(res, "Không tìm thấy cuộc hẹn", 404);

    // mỗi appointment chỉ được có 1 record
    const existing = await MedicalRecord.findOne({ appointment });
    if (existing) return responseError(res, "Hồ sơ bệnh án cho cuộc hẹn này đã tồn tại", 400);

    // lấy patient từ appointment nếu không truyền
    const patientId = patient || appt.patient;
    if (!isValidObjectId(patientId)) {
      return responseError(res, "patient id không hợp lệ", 400);
    }

    // --- Populate doctor và patient để điền snapshot ---
    const doctorDoc = await Doctor.findOne({ user: req.user._id }).populate('user', 'fullName');
    const patientDoc = await Patient.findById(patientId).populate('user', 'fullName address phone birthYear');

    // tạo mới record với snapshot đầy đủ
    const newRecord = new MedicalRecord({
      appointment,
      doctor: req.user._id,
      patient: patientId,
      doctorSnapshot: {
        fullName: doctorDoc?.user?.fullName || '',
        specialty: doctorDoc?.specialty?.toString() || '',
        location: doctorDoc?.location?.toString() || ''
      },
      patientSnapshot: {
        fullName: patientDoc?.user?.fullName || '',
        birthYear: patientDoc?.birthYear || null,
        address: patientDoc?.address || '',
        phone: patientDoc?.phone || ''
      },
      symptoms,
      diagnosis,
      prescriptions,
      ...rest,
    });

    await newRecord.save();

    // cập nhật appointment thành "completed"
    appt.status = "completed";
    await appt.save();

    return responseSuccess(res, "Tạo hồ sơ bệnh án thành công", newRecord);
  } catch (err) {
    console.error("createMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi tạo hồ sơ bệnh án", 500, err);
  }
};

// Lấy danh sách hồ sơ (admin thấy tất cả, bác sĩ chỉ thấy của mình, bệnh nhân chỉ thấy của mình)
const getMedicalRecords = async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();
    const filter = {};

    if (role === "doctor") {
      filter.doctor = req.user._id;
    } else if (role === "patient") {
      filter.patient = req.user._id;
    }
    // admin => không filter

    // pagination
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

    return responseSuccess(res, "Danh sách hồ sơ bệnh án", { total, page, limit, records });
  } catch (err) {
    console.error("getMedicalRecords error:", err);
    return responseError(res, "Lỗi server khi lấy danh sách hồ sơ bệnh án", 500, err);
  }
};

// Lấy danh sách hồ sơ theo ID bệnh nhân
// controllers/medicalRecord.controller.js
const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId || !isValidObjectId(patientId)) {
      return responseError(res, "ID bệnh nhân không hợp lệ", 400);
    }

    const role = (req.user.role || "").toLowerCase();

    // Bệnh nhân chỉ xem hồ sơ của chính mình
    if (role === "patient" && req.user._id.toString() !== patientId.toString()) {
      return responseError(res, "Bạn không có quyền truy cập hồ sơ của bệnh nhân khác", 403);
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const filter = { patient: patientId };

    const total = await MedicalRecord.countDocuments(filter);

    // Lấy danh sách hồ sơ, populate patient và appointment (chỉ thời gian)
    const records = await MedicalRecord.find(filter)
      .populate('patient', 'fullName birthYear address phone')
      .populate('appointment', 'date time status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map snapshot để trả về tên bác sĩ, chuyên khoa, cơ sở
    const recordsWithNames = await Promise.all(records.map(async r => {
      let specialtyName = '-', locationName = '-';

      if (r.doctorSnapshot?.specialty) {
        const specialty = await Specialty.findById(r.doctorSnapshot.specialty).lean();
        specialtyName = specialty?.name || '-';
      }

      if (r.doctorSnapshot?.location) {
        const location = await Location.findById(r.doctorSnapshot.location).lean();
        locationName = location?.name || '-';
      }

      return {
        ...r,
        doctorName: r.doctorSnapshot?.fullName || '-',
        specialtyName,
        locationName
      };
    }));


    return responseSuccess(res, "Danh sách hồ sơ bệnh án của bệnh nhân", {
      total,
      page,
      limit,
      records: recordsWithNames,
    });

  } catch (err) {
    console.error("getMedicalRecordsByPatient error:", err);
    return responseError(res, "Lỗi server khi lấy hồ sơ bệnh án theo bệnh nhân", 500, err);
  }
};

// Xem chi tiết 1 hồ sơ
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return responseError(res, "ID không hợp lệ", 400);
    }

    const record = await MedicalRecord.findById(id)
      .populate("doctor", "fullName")
      .populate("patient", "fullName birthYear address phone")
      .populate("appointment", "date time status")
      .lean();

    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);

    const role = (req.user.role || "").toLowerCase();
    if (role === "patient" && record.patient._id.toString() !== req.user._id.toString()) {
      return responseError(res, "Bạn không có quyền truy cập hồ sơ này", 403);
    }

    return responseSuccess(res, "Chi tiết hồ sơ bệnh án", record);
  } catch (err) {
    console.error("getMedicalRecordById error:", err);
    return responseError(res, "Lỗi server khi lấy chi tiết hồ sơ bệnh án", 500, err);
  }
};

// Bác sĩ cập nhật hồ sơ bệnh án
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return responseError(res, "ID không hợp lệ", 400);
    }

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);

    const role = (req.user.role || "").toLowerCase();
    if (role !== "doctor" || record.doctor.toString() !== req.user._id.toString()) {
      return responseError(res, "Bạn không có quyền cập nhật hồ sơ này", 403);
    }

    // chỉ cho phép update whitelist field
    const allowed = [
      "height",
      "weight",
      "bp",
      "pulse",
      "bmi",
      "symptoms",
      "diagnosis",
      "notes",
      "prescriptions",
      "conclusion",
      "careAdvice",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) record[field] = req.body[field];
    });

    await record.save();
    return responseSuccess(res, "Cập nhật hồ sơ bệnh án thành công", record);
  } catch (err) {
    console.error("updateMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi cập nhật hồ sơ bệnh án", 500, err);
  }
};

// Admin hoặc bác sĩ tạo record được phép xóa
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return responseError(res, "ID không hợp lệ", 400);
    }

    const record = await MedicalRecord.findById(id);
    if (!record) return responseError(res, "Không tìm thấy hồ sơ bệnh án", 404);

    const role = (req.user.role || "").toLowerCase();
    if (!(role === "admin" || (role === "doctor" && record.doctor.toString() === req.user._id.toString()))) {
      return responseError(res, "Bạn không có quyền xóa hồ sơ này", 403);
    }

    await record.deleteOne();
    return responseSuccess(res, "Xóa hồ sơ bệnh án thành công");
  } catch (err) {
    console.error("deleteMedicalRecord error:", err);
    return responseError(res, "Lỗi server khi xóa hồ sơ bệnh án", 500, err);
  }
};

const getMyMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user._id; 
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const filter = { patient: patientId };

    const total = await MedicalRecord.countDocuments(filter);
    const records = await MedicalRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        records
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
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
