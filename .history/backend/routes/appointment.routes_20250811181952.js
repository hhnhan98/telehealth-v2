// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Lấy tất cả lịch hẹn
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
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

// Lấy chi tiết lịch hẹn
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName email');

    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    // Chỉ người liên quan mới được xem
    if (
      (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// Tạo lịch hẹn mới
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Chỉ bệnh nhân mới có thể đặt lịch' });
    }

    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (doctorId, date, time)' });
    }

    // Kiểm tra bác sĩ tồn tại
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
    }

    // Parse ngày dd/mm/yyyy → Date object
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');

    if (!day || !month || !year || !hour || !minute) {
      return res.status(400).json({ error: 'Định dạng ngày hoặc giờ không hợp lệ' });
    }

    const appointmentDate = new Date(
      year,
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10)
    );

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Ngày giờ không hợp lệ' });
    }

    // Tạo lịch hẹn
    const newAppointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: appointmentDate,
      reason: reason || '',
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

// Cập nhật lịch hẹn
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền cập nhật' });
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: 'Cập nhật thành công', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật thất bại', details: err.message });
  }
});

// Hủy lịch hẹn
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền hủy' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Lịch hẹn đã bị hủy trước đó' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Đã hủy lịch hẹn', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Hủy thất bại', details: err.message });
  }
});

// Xóa lịch hẹn
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền xóa' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Đã xóa lịch hẹn' });
  } catch (err) {
    res.status(500).json({ error: 'Xóa thất bại', details: err.message });
  }
});

// Lấy lịch khám của bác sĩ
router.get('/doctor', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Chỉ bác sĩ mới có thể xem lịch này' });
    }

    const view = req.query.view || 'day';
    const now = new Date();

    let start, end;
    if (view === 'day') {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
    } else if (view === 'week') {
      const dayOfWeek = now.getDay(); // 0=CN
      start = new Date(now);
      start.setDate(start.getDate() - dayOfWeek + 1); // Thứ 2
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const appointments = await Appointment.find({
      doctor: req.user.id,
      date: { $gte: start, $lte: end }
    }).populate('patient', 'fullName email');

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

module.exports = router;
