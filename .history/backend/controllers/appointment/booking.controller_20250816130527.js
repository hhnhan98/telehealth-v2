const mongoose = require("mongoose");
const Appointment = require("../../models/Appointment");
const User = require("../../models/User");
const Doctor = require("../../models/Doctor");
const Specialty = require("../../models/Specialty");
const Location = require("../../models/Location");

// =============================
// 1. Lấy danh sách cơ sở
// =============================
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({}, "name");
    res.json({ locations });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách cơ sở", details: err.message });
  }
};

// =============================
// 2. Lấy danh sách chuyên khoa theo cơ sở
// =============================
const getSpecialtiesByLocation = async (req, res) => {
  try {
    const { locationId } = req.query;

    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: "ID cơ sở không hợp lệ" });
    }

    const specialties = await Specialty.find({ location: locationId }, "name");
    res.json({ specialties });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách chuyên khoa", details: err.message });
  }
};

// =============================
// 3. Lấy danh sách bác sĩ theo chuyên khoa + cơ sở
// =============================
const getDoctorsBySpecialtyAndLocation = async (req, res) => {
  try {
    const { specialtyId, locationId } = req.query;

    if (!specialtyId || !mongoose.Types.ObjectId.isValid(specialtyId)) {
      return res.status(400).json({ error: "ID chuyên khoa không hợp lệ" });
    }
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: "ID cơ sở không hợp lệ" });
    }

    const doctors = await Doctor.find(
      { specialty: specialtyId, location: locationId },
      "fullName"
    );

    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách bác sĩ", details: err.message });
  }
};

// =============================
// 4. Lấy khung giờ trống
// =============================
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: "ID bác sĩ không hợp lệ" });
    }
    if (!date) {
      return res.status(400).json({ error: "Ngày không hợp lệ" });
    }

    // Giờ hành chính cố định (30 phút/lượt khám)
    const slots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];

    const bookedAppointments = await Appointment.find({ doctor: doctorId, date });
    const bookedTimes = bookedAppointments.map(appt => appt.time);

    const availableSlots = slots.filter(time => !bookedTimes.includes(time));
    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy khung giờ trống", details: err.message });
  }
};

// =============================
// 5. Tạo lịch hẹn (bắt buộc user login -> có patientId)
// =============================
const createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // ✅ luôn lấy từ JWT
    const { doctorId, specialtyId, locationId, date, time } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "ID bệnh nhân không hợp lệ" });
    }

    // Lấy thông tin bệnh nhân từ User model
    const patientInfo = await User.findById(patientId, "fullName email");
    if (!patientInfo) {
      return res.status(404).json({ error: "Không tìm thấy thông tin bệnh nhân" });
    }

    // Tạo lịch hẹn
    const appointment = new Appointment({
      patient: {
        _id: patientInfo._id,
        fullName: patientInfo.fullName,
        email: patientInfo.email,
      },
      doctor: doctorId,
      specialty: specialtyId,
      location: locationId,
      date,
      time,
      status: "pending",
    });

    await appointment.save();
    res.status(201).json({ message: "Đặt lịch thành công", appointment });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tạo lịch hẹn", details: err.message });
  }
};

// =============================
// 6. Lấy danh sách lịch hẹn của user hiện tại
// =============================
const getAppointments = async (req, res) => {
  try {
    const patientId = req.user.id; // ✅ đồng bộ với createAppointment

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "User ID không hợp lệ" });
    }

    const appointments = await Appointment.find({ "patient._id": patientId })
      .populate("doctor", "fullName")
      .populate("specialty", "name")
      .populate("location", "name")
      .sort({ date: -1, time: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách lịch hẹn", details: err.message });
  }
};

// =============================
// 7. Xác thực OTP (demo)
// =============================
const verifyOtp = async (req, res) => {
  try {
    const { appointmentId, otp } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }

    // Demo: OTP luôn = "123456"
    if (otp === "123456") {
      appointment.status = "confirmed";
      await appointment.save();
      return res.json({ message: "Xác thực thành công", appointment });
    }

    res.status(400).json({ error: "OTP không chính xác" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xác thực OTP", details: err.message });
  }
};

// =============================
// 8. Hủy lịch hẹn
// =============================
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const appointment = await Appointment.findOneAndDelete({
      _id: id,
      "patient._id": patientId,
    });

    if (!appointment) {
      return res.status(404).json({ error: "Không tìm thấy hoặc không có quyền hủy lịch hẹn này" });
    }

    res.json({ message: "Hủy lịch hẹn thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi hủy lịch hẹn", details: err.message });
  }
};

module.exports = {
  getLocations,
  getSpecialtiesByLocation,
  getDoctorsBySpecialtyAndLocation,
  getAvailableSlots,
  createAppointment,
  getAppointments,       // ✅ thêm hàm lấy lịch sử hẹn
  verifyOtp,
  cancelAppointment,
};
