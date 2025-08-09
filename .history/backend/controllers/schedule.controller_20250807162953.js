const Schedule = require('../models/Schedule');

const getAvailableScheduleByDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'Thiếu ngày' });

    const schedule = await Schedule.findOne({ doctor: doctorId, date });

    if (!schedule) return res.status(404).json({ error: 'Không có lịch làm việc' });

    // Lọc ra các khung giờ chưa bị đặt (nếu có logic đặt lịch)
    res.json(schedule.slots);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getAvailableScheduleByDate };
