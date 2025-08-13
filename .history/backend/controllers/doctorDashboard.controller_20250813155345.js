const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

const getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      time: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('patient', 'fullName')
      .sort({ time: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Lỗi getTodayAppointments:', err);
    res.status(500).json({ error: 'Lỗi khi lấy lịch khám hôm nay', details: err.message });
  }
};

const getPatientsCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'patient' });
    res.json({ count });
  } catch (err) {
    console.error('Lỗi getPatientsCount:', err);
    res.status(500).json({ error: 'Lỗi khi đếm bệnh nhân', details: err.message });
  }
};

const getNewMedicalRecords = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const count = await MedicalRecord.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    res.json({ count });
  } catch (err) {
    console.error('Lỗi getNewMedicalRecords:', err);
    res.status(500).json({ error: 'Lỗi khi đếm hồ sơ bệnh án mới', details: err.message });
  }
};

module.exports = {
  getTodayAppointments,
  getPatientsCount,
  getNewMedicalRecords,
};
