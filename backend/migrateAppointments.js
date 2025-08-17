// migrateAppointments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

const migrateAppointments = async () => {
  try {
    const appointments = await Appointment.find({});
    console.log(`Tổng số appointment: ${appointments.length}`);

    for (let appt of appointments) {
      if (!appt.datetime && appt.date && appt.time) {
        const [hour, minute] = appt.time.split(':').map(Number);
        const newDatetime = new Date(appt.date);
        newDatetime.setHours(hour, minute, 0, 0);

        appt.datetime = newDatetime;
        await appt.save();

        console.log(`✅ Cập nhật appointment ${appt._id}: datetime = ${appt.datetime.toISOString()}`);
      }
    }

    console.log('🎉 Hoàn tất migrate tất cả appointment!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Lỗi migrateAppointments:', err);
    process.exit(1);
  }
};

migrateAppointments();
