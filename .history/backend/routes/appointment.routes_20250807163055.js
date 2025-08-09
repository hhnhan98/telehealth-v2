const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const { getAvailableScheduleByDate } = require('../controllers/schedule.controller');

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

// GET /schedule/:doctorId?date=YYYY-MM-DD
router.get('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'Thiếu thông tin bác sĩ hoặc ngày' });
    }

    const weekday = new Date(date).getDay(); // 0 = CN, 1 = T2,...

    // 1. Lấy lịch làm việc
    const schedule = await Schedule.findOne({ doctor: doctorId, weekday });
    if (!schedule || !schedule.slots || schedule.slots.length === 0) {
      return res.json({ availableTimeSlots: [] });
    }

    // 2. Lấy các lịch hẹn đã đặt trong ngày đó
    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const bookedSlots = appointments.map((a) =>
      new Date(a.date).toTimeString().slice(0, 5) // cắt ra dạng "HH:mm"
    );

    // 3. Lọc ra slot còn trống
    const availableTimeSlots = schedule.slots.filter(slot => !bookedSlots.includes(slot));

    return res.json({ availableTimeSlots });
  } catch (err) {
    console.error('Lỗi lấy lịch rảnh:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
