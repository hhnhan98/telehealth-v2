// --- Tạo lịch hẹn cho bác sĩ và bệnh nhân ---
const startSeedDate = new Date('2025-08-16');
const endSeedDate = new Date('2025-08-31');

// Slot cố định 9–11h cho mỗi bác sĩ mỗi ngày
for (let doc of doctors) {
  for (let d = new Date(startSeedDate); d <= endSeedDate; d.setDate(d.getDate() + 1)) {
    for (let hour = 9; hour <= 11; hour++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];

      const apptDate = new Date(d);
      apptDate.setHours(hour, 0, 0, 0);

      const timeStr = `${hour.toString().padStart(2,'0')}:00`;

      await Appointment.create({
        location: doc.doctor.location,
        specialty: doc.user.specialty,
        doctor: doc.doctor._id,
        date: apptDate.toDateString(),
        time: timeStr,
        datetime: apptDate,
        patient: {
          _id: patient._id,
          fullName: patient.fullName,
          email: patient.email
        },
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
  }
}

// Mỗi bệnh nhân thêm tối đa 3 slot ngẫu nhiên
for (let pat of patients) {
  let added = 0;
  while (added < 3) {
    const doc = doctors[Math.floor(Math.random() * doctors.length)];
    const randDay = new Date(startSeedDate);
    randDay.setDate(randDay.getDate() + Math.floor(Math.random() * (endSeedDate.getDate() - startSeedDate.getDate() + 1)));
    const hour = 12 + Math.floor(Math.random() * 5); // 12–16h
    const timeStr = `${hour.toString().padStart(2,'0')}:00`;

    // Kiểm tra slot trùng
    const exists = await Appointment.findOne({
      doctor: doc.doctor._id,
      date: randDay.toDateString(),
      time: timeStr
    });
    if (exists) continue;

    const apptDate = new Date(randDay);
    apptDate.setHours(hour, 0, 0, 0);

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await Appointment.create({
      location: doc.doctor.location,
      specialty: doc.user.specialty,
      doctor: doc.doctor._id,
      date: apptDate.toDateString(),
      time: timeStr,
      datetime: apptDate,
      patient: {
        _id: pat._id,
        fullName: pat.fullName,
        email: pat.email
      },
      status
    });

    added++;
  }
}
