const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;
    console.log('>>> Doctor ID:', doctorId);

    // Ngày hôm nay theo local time VN
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    console.log('>>> Today (VN) YYYY-MM-DD:', todayStr);

    // Lấy lịch hẹn hôm nay
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: todayStr,
      status: { $ne: 'cancelled' },
    }).populate('patient', 'fullName email').sort({ time: 1 });
    console.log('>>> Today Appointments count:', todayAppointments.length);
    console.log('>>> Today Appointments:', todayAppointments);

    // Tổng lượt khám tuần này
    const dayOfWeek = today.getDay(); // 0=CN,...6=T7
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date();
    monday.setDate(today.getDate() - diffToMonday);
    const mondayStr = monday.toISOString().split('T')[0];
    console.log('>>> Monday (start of week) YYYY-MM-DD:', mondayStr);

    const weeklyAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: mondayStr, $lte: todayStr },
      status: { $ne: 'cancelled' },
    });
    console.log('>>> Weekly Appointments Count:', weeklyAppointmentsCount);

    res.json({
      todayAppointments,
      weeklyAppointmentsCount,
    });
  } catch (err) {
    console.error('Lỗi dashboard bác sĩ:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
};
