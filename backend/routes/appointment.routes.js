const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middlewares/auth');

// ✅ Lấy tất cả lịch hẹn (sau này có thể lọc theo vai trò user)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Lấy lịch hẹn theo ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');
    if (!appointment)
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ✅ Tạo lịch hẹn mới (bệnh nhân tạo)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { doctor, date, reason } = req.body;

    if (!doctor || !date || !reason) {
      return res.status(400).json({ error: 'Thiếu thông tin đặt lịch' });
    }

    const patient = req.user.id;

    const newAppointment = new Appointment({
      patient,
      doctor,
      date,
      reason,
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
    res.status(400).json({
      error: 'Tạo lịch hẹn thất bại',
      details: err.message,
    });
  }
});

// ✅ Cập nhật lịch hẹn (ví dụ đổi thời gian)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    res.json({ message: 'Cập nhật thành công', appointment: updated });
  } catch (err) {
    res.status(400).json({ error: 'Cập nhật thất bại', details: err.message });
  }
});

// ✅ Hủy lịch hẹn — thay đổi trạng thái thành "cancelled"
router.patch('/:id/cancel', authenticateJWT, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền (chỉ bệnh nhân tạo lịch mới được hủy)
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

// ✅ Xoá lịch hẹn
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    res.json({ message: 'Đã xoá lịch hẹn' });
  } catch (err) {
    res.status(500).json({ error: 'Xoá thất bại', details: err.message });
  }
});

module.exports = router;