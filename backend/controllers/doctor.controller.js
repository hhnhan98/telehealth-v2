const User = require("../models/User");

const getPatientsWithLastRecord = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .populate({
        path: "healthRecords",
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .select("name dob healthRecords");

    res.json(patients);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getPatientsWithLastRecord,
  // các controller khác ở đây (nếu có)
};