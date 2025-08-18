// controllers/schedule.controller.js
const Schedule = require('../models/Schedule');

// Lấy các khung giờ trống của bác sĩ theo ngày
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId và date là bắt buộc' });
  }

  try {
    const schedule = await Schedule.findOne({ doctorId, date });

    if (!schedule) {
      return res.status(404).json({ error: 'Không tìm thấy lịch' });
    }

    const availableSlots = schedule.slots.filter(slot => !slot.isBooked);
    res.json({ slots: availableSlots });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Lỗi khi lấy khung giờ trống', details: err.message });
  }
};

module.exports = { getAvailableSlots };
