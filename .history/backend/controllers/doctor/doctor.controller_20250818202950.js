// const Appointment = require('../../models/Appointment');

// // ----------------- Helper -----------------
// const generateTimeSlots = () => {
//   const slots = [];

//   // Buổi sáng
//   for (let hour = 8; hour < 11; hour++) {
//     slots.push(`${hour.toString().padStart(2,'0')}:00`);
//     slots.push(`${hour.toString().padStart(2,'0')}:30`);
//   }
//   slots.push('11:00');

//   // Buổi chiều
//   for (let hour = 13; hour < 17; hour++) {
//     slots.push(`${hour.toString().padStart(2,'0')}:00`);
//     slots.push(`${hour.toString().padStart(2,'0')}:30`);
//   }
//   slots.push('17:00');

//   return slots;
// };

// // ----------------- API: Lấy lịch làm việc -----------------
// const getWorkSchedule = async (req, res) => {
//   try {
//     const doctorId = req.user._id;
//     const view = req.query.view || 'day';

//     const vnOffset = 7 * 60; // phút

//     const nowUTC = new Date();

//     // --- Helper convert VN ↔ UTC ---
//     const toUTC = (dateVN) => new Date(dateVN.getTime() - vnOffset * 60000);
//     const toVN = (dateUTC) => new Date(dateUTC.getTime() + vnOffset * 60000);

//     // --- Xác định start/end date VN ---
//     let startVN, endVN;

//     if (view === 'week') {
//       // Tính thứ 2 → CN tuần hiện tại VN
//       const todayVN = toVN(nowUTC);
//       const dayOfWeekVN = (todayVN.getDay() + 6) % 7; // 0=CN, 1=T2
//       startVN = new Date(todayVN);
//       startVN.setDate(todayVN.getDate() - dayOfWeekVN);
//       startVN.setHours(0, 0, 0, 0);

//       endVN = new Date(startVN);
//       endVN.setDate(startVN.getDate() + 6);
//       endVN.setHours(23, 59, 59, 999);
//     } else {
//       // Chỉ hôm nay
//       const todayVN = toVN(nowUTC);
//       startVN = new Date(todayVN);
//       startVN.setHours(0, 0, 0, 0);

//       endVN = new Date(todayVN);
//       endVN.setHours(23, 59, 59, 999);
//     }

//     // --- Convert về UTC để query ---
//     const startUTC = toUTC(startVN);
//     const endUTC = toUTC(endVN);

//     // --- Lấy appointment ---
//     const appointments = await Appointment.find({
//       doctor: doctorId,
//       datetime: { $gte: startUTC, $lte: endUTC },
//       status: { $ne: 'cancelled' }
//     })
//       .populate('patient', 'fullName email')
//       .sort({ datetime: 1 });

//     // --- Build schedule ---
//     const numDays = view === 'week' ? 7 : 1;
//     const schedule = [];

//     for (let i = 0; i < numDays; i++) {
//       const dayVN = new Date(startVN);
//       dayVN.setDate(startVN.getDate() + i);
//       const dayKey = dayVN.toISOString().split('T')[0]; // YYYY-MM-DD VN

//       // Khởi tạo slot giờ làm việc
//       const slots = generateTimeSlots().map(time => ({ time, appointment: null }));

//       // Gán appointment
//       const apptsOfDay = appointments.filter(appt => {
//         const apptVN = toVN(appt.datetime);
//         const apptDateStr = apptVN.toISOString().split('T')[0];
//         return apptDateStr === dayKey;
//       });

//       apptsOfDay.forEach(appt => {
//         const apptVN = toVN(appt.datetime);
//         const slotTime = `${apptVN.getHours().toString().padStart(2,'0')}:${apptVN.getMinutes().toString().padStart(2,'0')}`;
//         const slot = slots.find(s => s.time === slotTime);
//         if (slot) {
//           slot.appointment = {
//             _id: appt._id,
//             patient: appt.patient,
//             status: appt.status
//           };
//         }
//       });

//       schedule.push({ date: dayKey, slots });
//     }

//     res.json(schedule);

//   } catch (err) {
//     console.error('Lỗi lấy lịch làm việc:', err);
//     res.status(500).json({ error: 'Lỗi server', details: err.message });
//   }
// };

// module.exports = { getWorkSchedule };
