exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    // Chỉ cho hủy nếu trạng thái là confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Chỉ có thể hủy lịch hẹn đã xác nhận' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Đã hủy lịch hẹn', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hủy lịch hẹn', error });
  }
};