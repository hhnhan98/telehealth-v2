// scripts/expire.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const ScheduleService = require("../services/schedule.service");
const dayjs = require("dayjs");

// Kết nối MongoDB nếu chạy như script độc lập
if (!mongoose.connection.readyState) {
  require("dotenv").config();
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Cron chạy mỗi phút
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log(`[CRON] expireAppointments start - ${dayjs(now).format("YYYY-MM-DD HH:mm:ss")}`);

  try {
    const expiredAppointments = await Appointment.find({
      status: "pending",
      datetime: { $lt: now },
    }).limit(100);

    if (expiredAppointments.length > 0) {
      console.log(`[CRON] Expiring ${expiredAppointments.length} appointments...`);
    }

    for (const ap of expiredAppointments) {
      try {
        const date = dayjs(ap.datetime).format("YYYY-MM-DD");
        const time = dayjs(ap.datetime).format("HH:mm");

        if (ScheduleService?.cancelSlot) {
          await ScheduleService.cancelSlot(ap.doctor, date, time);
        }

        ap.status = "expired";
        ap.otp = null;
        ap.otpExpiresAt = null;
        await ap.save();
      } catch (err) {
        console.error(`[CRON] Lỗi expire appointment ${ap._id}:`, err.message);
      }
    }

    if (expiredAppointments.length > 0) {
      console.log(`[CRON] ✅ Done. ${expiredAppointments.length} appointments expired.`);
    }
  } catch (err) {
    console.error("[CRON] ❌ Lỗi expireAppointments:", err.message);
  }

  console.log("[CRON] expireAppointments end\n");
});
