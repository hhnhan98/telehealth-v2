// controllers/appointment/booking.controller.js

const Location = require('../../models/Location');
const Specialty = require('../../models/Specialty');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');

const WORK_HOURS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'
];

// Tạo appointment, lưu patient chuẩn
const createAppointment = async (req, res) => {
  const { location, specialty, doctor, date, time, patientId } = req.body;
  if (!location || !specialty || !doctor || !date || !time || !patientId)
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

  const today = new Date().toISOString().split('T')[0];
  if (date < today) return res.status(400).json({ error: 'Không thể đặt lịch quá khứ' });

  try {
    const patientInfo = await User.findById(patientId).select('-password');
    if (!patientInfo) return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });

    let schedule = await Schedule.findOne({ doctor, date });
    if (!schedule) {
      const slots = WORK_HOURS.map(t => ({ time: t, isBooked: false }));
      schedule = new Schedule({ doctor, date, slots });
      await schedule.save();
    }

    const slot = schedule.slots.find(s => s.time === time);
    if (!slot) return res.status(400).json({ error: 'Giờ này không có trong lịch' });
    if (slot.isBooked) return res.status(400).json({ error: 'Giờ này đã được đặt' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    console.log(`>>> OTP cho bệnh nhân ${patientInfo.fullName || patientInfo.email}:`, otp);

    const newAppt = new Appointment({
      location,
      specialty,
      doctor,
      date,
      time,
      patient: {
        _id: patientInfo._id,
        fullName: patientInfo.fullName,
        email: patientInfo.email
      },
      otp,
      otpExpiresAt,
      isVerified: false,
      status: 'pending',
      workScheduleId: schedule._id
    });

    await newAppt.save();
    res.status(201).json({ message: 'Đặt lịch thành công. OTP đã gửi.', appointment: newAppt });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo lịch hẹn', details: err.message });
  }
};

module.exports = { createAppointment };
