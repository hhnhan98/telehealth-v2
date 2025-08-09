const Schedule = require('../models/Schedule');

// 📌 Lấy lịch rảnh của bác sĩ theo ngày
exports.getDoctorScheduleByDate = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });
  }

  try {
    const schedule = await Schedule.findOne({
      doctor: doctorId,
      date: new Date(date),
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch rảnh' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Lỗi khi lấy lịch:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// 📌 Tạo lịch rảnh mới
exports.createSchedule = async (req, res) => {
  const { doctor, date, timeSlots } = req.body;

  if (!doctor || !date || !timeSlots || !Array.isArray(timeSlots)) {
    return res.status(400).json({ error: 'Thiếu thông tin hoặc sai định dạng' });
  }

  try {
    const existing = await Schedule.findOne({ doctor, date: new Date(date) });
    if (existing) {
      return res.status(400).json({ error: 'Lịch đã tồn tại cho ngày này' });
    }

    const schedule = new Schedule({ doctor, date: new Date(date), timeSlots });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Lỗi khi tạo lịch:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// 📌 Cập nhật lịch rảnh
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { date, timeSlots } = req.body;

  try {
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({ error: 'Không tìm thấy lịch' });
    }

    if (date) schedule.date = new Date(date);
    if (Array.isArray(timeSlots)) schedule.timeSlots = timeSlots;

    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error('Lỗi khi cập nhật lịch:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// 📌 Xoá lịch rảnh
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Schedule.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Không tìm thấy lịch' });
    }

    res.json({ message: 'Xoá lịch thành công' });
  } catch (error) {
    console.error('Lỗi khi xoá lịch:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
