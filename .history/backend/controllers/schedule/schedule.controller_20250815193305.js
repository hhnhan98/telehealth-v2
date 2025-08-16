const Schedule = require('../../models/Schedule');
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

// ----------------------
// 1. Lấy khung giờ rảnh của bác sĩ theo ngày
// ----------------------
exports.getDoctorAvailableSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!doctorId || !date) return res.status(400).json({ error: 'Thiếu doctorId hoặc date' });

  try {
    // Lấy schedule
    const schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) return res.status(404).json({ error: 'Bác sĩ chưa có lịch làm việc ngày này' });

    // Filter slot chưa booked
    const availableSlots = schedule.slots.filter(slot => !slot.isBooked).map(slot => slot.time);

    res.status(200).json({ availableSlots });
  } catch (err) {
    console.error('Lỗi khi lấy khung giờ rảnh:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ----------------------
// 2. Lấy toàn bộ lịch làm việc bác sĩ theo ngày hoặc tuần
// ----------------------
exports.getDoctorWorkSchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { date, view } = req.query; // view: 'day' | 'week'

  try {
    let schedules;
    if (view === 'week' && date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // tuần 7 ngày
      schedules = await Schedule.find({
        doctor: doctorId,
        date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
      });
    } else if (date) {
      schedules = await Schedule.find({ doctor: doctorId, date });
    } else {
      return res.status(400).json({ error: 'Thiếu params date' });
    }

    res.status(200).json({ schedules });
  } catch (err) {
    console.error('Lỗi khi lấy lịch làm việc:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ----------------------
// 3. Tạo lịch làm việc mới cho bác sĩ 1 ngày
// ----------------------
exports.createWorkSchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { date, slots } = req.body; // slots: ['08:00','08:30',...]

  if (!date || !slots || !slots.length) return res.status(400).json({ error: 'Thiếu date hoặc slots' });

  try {
    // Kiểm tra lịch đã tồn tại
    const exists = await Schedule.findOne({ doctor: doctorId, date });
    if (exists) return res.status(400).json({ error: 'Lịch đã tồn tại ngày này' });

    const schedule = new Schedule({
      doctor: doctorId,
      date,
      slots: slots.map(time => ({ time }))
    });

    await schedule.save();
    res.status(201).json({ message: 'Tạo lịch thành công', schedule });
  } catch (err) {
    console.error('Lỗi tạo lịch:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ----------------------
// 4. Cập nhật lịch làm việc (thêm/xóa slot)
// ----------------------
exports.updateWorkSchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { date, slots } = req.body; // slots mới: [{time: '08:00'}, ...]

  if (!date || !slots) return res.status(400).json({ error: 'Thiếu date hoặc slots' });

  try {
    const schedule = await Schedule.findOne({ doctor: doctorId, date });
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch' });

    schedule.slots = slots;
    await schedule.save();

    res.status(200).json({ message: 'Cập nhật lịch thành công', schedule });
  } catch (err) {
    console.error('Lỗi cập nhật lịch:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// ----------------------
// 5. Xóa lịch làm việc
// ----------------------
exports.deleteWorkSchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { date } = req.body;

  if (!date) return res.status(400).json({ error: 'Thiếu date' });

  try {
    const schedule = await Schedule.findOneAndDelete({ doctor: doctorId, date });
    if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch' });

    res.status(200).json({ message: 'Xóa lịch thành công' });
  } catch (err) {
    console.error('Lỗi xóa lịch:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
