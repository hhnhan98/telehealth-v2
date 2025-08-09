const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Appointment = require('../models/Appointment');

// ✅ Lấy tất cả lịch hẹn (admin/doctor xem hết, bệnh nhân xem của mình)
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};

    // Nếu là bệnh nhân thì chỉ lấy lịch hẹn của chính họ
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    }

    // Nếu là bác sĩ thì lấy lịch của bác sĩ
    if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// ✅ Lấy chi tiết lịch hẹn theo ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    // Kiểm tra quyền xem
    if (
      req.user.role === 'patient' && appointment.patient.toString() !== req.user.id ||
      req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: 'Không có quyền truy cập lịch hẹn này' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// ✅ Tạo lịch hẹn mới (chỉ bệnh nhân)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Chỉ bệnh nhân mới có thể đặt lịch' });
    }

    const { doctor, date, time, reason } = req.body;

    if (!doctor || !date || !time || !reason) {
      return res.status(400).json({ error: 'Thiếu thông tin đặt lịch' });
    }

    // Ghép thời gian
    const fullDate = new Date(`${date}T${time}:00`);

    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor,
      date: fullDate,
      reason,
      status: 'pending',
    });

    await newAppointment.save();

    const populated = await Appointment.findById(newAppointment._id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    res.status(201).json({
      message: 'Tạo lịch hẹn thành công',
      appointment: populated,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Tạo lịch hẹn thất bại',
      details: err.message,
    });
  }
});

// ✅ Cập nhật lịch hẹn (chỉ người đặt)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền cập nhật lịch hẹn này' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Cập nhật thành công', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật thất bại', details: err.message });
  }
});

// ✅ Hủy lịch hẹn (chỉ người đặt)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền hủy lịch hẹn này' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Lịch hẹn đã bị hủy trước đó' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Đã hủy lịch hẹn', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Hủy lịch thất bại', details: err.message });
  }
});

// ✅ Xoá lịch hẹn (chỉ người đặt)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền xoá lịch hẹn này' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Đã xoá lịch hẹn' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
});

module.exports = router;
