const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const { verifyToken } = require('../middlewares/auth');

// Lấy tất cả lịch hẹn (sẽ thêm lọc theo vai trò sau này)
router.get('/', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy lịch hẹn theo ID
router.get('/:id', verifyToken, async (req, res) => {
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

// Tạo lịch hẹn mới (chỉ bệnh nhân)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { doctor, date, reason } = req.body;
    if (!doctor || !date || !reason) {
      return res.status(400).json({ error: 'Thiếu thông tin đặt lịch' });
    }

    const newAppointment = new Appointment({
      patient: req.user.id,
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

// Cập nhật lịch hẹn (chỉ người đặt được sửa)
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
    res.status(400).json({ error: 'Cập nhật thất bại', details: err.message });
  }
});

// hủy lịch hẹn (chỉ bệnh nhân đặt mới được hủy)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    }

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

// Xoá lịch hẹn (chỉ người tạo mới được xoá)
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
