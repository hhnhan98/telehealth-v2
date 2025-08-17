// controllers/doctor/doctorDashboard.controller.js
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const MedicalRecord = require('../../models/MedicalRecord');

const generateTimeSlots = (startHour = 8, endHour = 17, intervalMinutes = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2,'0')}:00`);
    slots.push(`${hour.toString().padStart(2,'0')}:30`);
  }
  slots.push(`${endHour.toString().padStart(2,'0')}:00`);
  return slots;
};

const formatDate = d => d.toISOString().split('T')[0];

// --- Dashboard ---
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName email').sort({ datetime: 1 });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = await MedicalRecord.find({
      doctor: doctorId,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5).populate('patient', 'fullName email');

    const totalPatients = await User.countDocuments({ role: 'patient' });

    res.json({ todayAppointments, recentRecords, totalPatients });
  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData };
