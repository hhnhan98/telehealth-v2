const Appointment = require('../models/Appointment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');

const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      time: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName').sort({ time: 1 });

    const totalPatients = await User.countDocuments({ role: 'patient' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecordsCount = await MedicalRecord.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      doctor: doctorId
    });

    res.json({
      todayAppointments,
      totalPatients,
      recentRecordsCount
    });
  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};

// Lấy lịch tuần (8:00–17:00)
const getWeeklySchedule = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      time: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $ne: 'cancelled' }
    }).populate('patient', 'fullName');

    // Tạo mảng tuần 7 ngày, 8:00–17:00
    const schedule = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const slots = [];
      for (let h = 8; h <= 17; h++) slots.push(null);
      schedule.push({ date: day, slots });
    }

    // Gán appointment vào slots
    appointments.forEach(appt => {
      const apptDate = new Date(appt.time);
      const dayIndex = Math.floor((apptDate - startOfWeek)/(1000*60*60*24));
      const hour = apptDate.getHours();
      if(dayIndex>=0 && dayIndex<7 && hour>=8 && hour<=17){
        schedule[dayIndex].slots[hour-8] = appt.patient.fullName;
      }
    });

    res.json(schedule);

  } catch (err) {
    console.error('Lỗi lấy lịch tuần:', err);
    res.status(500).json({ error:'Lỗi server', details: err.message });
  }
};

module.exports = { getDashboardData, getWeeklySchedule };
