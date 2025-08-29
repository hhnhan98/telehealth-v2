// scripts/expire.js
const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const ScheduleService = require('../services/schedule.service'); // nếu có service quản lý slot

// Kết nối MongoDB nếu chạy như script độc lập
if (!mongoose.connection.readyState) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

cron.schedule('*/5 * * * *', async () => {
  console.log('[CRON] Running expireAppointments job...');
  try {
    const now = new Date();
    const expiredAppointments = await Appointment.find({
      status: 'pending',
      datetime: { $lt: now }
    }).limit(100); // batch 100 để tránh quá tải

    for (const ap of expiredAppointments) {
      try {
        // Nếu bạn có ScheduleService thì free slot cho doctor
        if (ScheduleService.cancelSlot) {
          await ScheduleService.cancelSlot(ap.doctor, ap.datetime);
        }

        ap.status = 'expired';
        ap.otp = null;
        ap.otpExpiresAt = null;
        await ap.save();

        console.log(`[CRON] Appointment ${ap._id} marked expired`);
      } catch (err) {
        console.error(`[CRON] Error expiring appointment ${ap._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[CRON] expireAppointments error:', err);
  }
});
