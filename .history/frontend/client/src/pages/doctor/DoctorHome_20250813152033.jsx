// src/pages/doctor/DoctorHome.jsx
import React, { useEffect, useState } from 'react';
import './DoctorHome.css';

const DoctorHome = () => {
  const [summary, setSummary] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    newMedicalRecords: 0,
  });

  // Mô phỏng gọi API lấy dữ liệu tóm tắt
  useEffect(() => {
    // Đây là dữ liệu mock, sau này sẽ gọi API thật
    const mockData = {
      todayAppointments: 5,
      totalPatients: 120,
      newMedicalRecords: 3,
    };
    setSummary(mockData);
  }, []);

  return (
    <div className="doctor-home">
      <h2>Chào mừng, Bác sĩ</h2>
      <p>Đây là trang chủ quản lý Telehealth</p>

      <div className="summary-cards">
        <div className="card">
          <h3>Lịch khám hôm nay</h3>
          <p>{summary.todayAppointments}</p>
        </div>
        <div className="card">
          <h3>Tổng bệnh nhân</h3>
          <p>{summary.totalPatients}</p>
        </div>
        <div className="card">
          <h3>Hồ sơ bệnh án mới</h3>
          <p>{summary.newMedicalRecords}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
