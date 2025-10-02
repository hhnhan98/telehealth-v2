// Sinh lịch giờ hành chính 30 phút
const generateDailySchedule = (doctorId, date) => {
  const slots = [];
  const morning = ['08:00','08:30','09:00','09:30','10:00','10:30',];
  const afternoon = ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
  
  [...morning, ...afternoon].forEach(time => slots.push({ time, isBooked: false }));
  return { doctor: doctorId, date, slots };
};

module.exports = { generateDailySchedule };
