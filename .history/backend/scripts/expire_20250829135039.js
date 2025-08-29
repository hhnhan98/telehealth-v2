// scripts/expire.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const ScheduleService = require("../services/schedule.service"); // nếu có service quản lý slot
const dayjs = require("dayjs");

// Kết nối MongoDB nếu chạy như script độc lập
if (!mongoose.connection.readyState) {
  require("dotenv").config();
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Cron chạy mỗi 5 phút
cron.schedule("** * * *", async () => {
  const now = new Date();
  console.log("\n[CRON] ===== expireAppointments job start =====");
  console.log("[CRON] Thời gian hiện tại:", dayjs(now).format("YYYY-MM-DD HH:mm:ss"));

  try {
    const expiredAppointments = await Appointment.find({
      status: "pending",
      datetime: { $lt: now },
    }).limit(100); // batch 100 để tránh quá tải

    if (expiredAppointments.length === 0) {
      console.log("[CRON] Không có appointment nào hết hạn.");
    } else {
      console.log(`[CRON] Tìm thấy ${expiredAppointments.length} appointment cần expire.`);
    }

    for (const ap of expiredAppointments) {
      try {
        // Nếu bạn có ScheduleService thì free slot cho doctor
        if (ScheduleService?.cancelSlot) {
          await ScheduleService.cancelSlot(ap.doctor, ap.datetime);
          console.log(`[CRON] Slot của doctor ${ap.doctor} lúc ${ap.datetime} đã được giải phóng.`);
        }

        ap.status = "expired";
        ap.otp = null;
        ap.otpExpiresAt = null;
        await ap.save();

        console.log(`[CRON] Appointment ${ap._id} => expired`);
      } catch (err) {
        console.error(`[CRON] Lỗi khi expire appointment ${ap._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("[CRON] Lỗi expireAppointments:", err);
  }

  console.log("[CRON] ===== expireAppointments job end =====\n");
});
