// scripts/clearSchedules.js
const mongoose = require("mongoose");
require("dotenv").config();

const Schedule = require("../models/Schedule");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telehealth";

async function clearSchedules() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(">>> Connected to MongoDB");

    // Xóa toàn bộ dữ liệu collection schedules
    await Schedule.deleteMany({});
    console.log(">>> Collection 'schedules' đã được xóa hoàn toàn");

    // Xóa index doctorId + date để tránh duplicate key khi seed
    await Schedule.collection.dropIndexes();
    console.log(">>> Indexes của collection 'schedules' đã được xóa");

    console.log(">>> Xong! Bạn có thể chạy lại seedDemoData.js");
    process.exit();
  } catch (err) {
    console.error(">.< Lỗi khi xóa collection hoặc index:", err);
    process.exit(1);
  }
}

clearSchedules();
