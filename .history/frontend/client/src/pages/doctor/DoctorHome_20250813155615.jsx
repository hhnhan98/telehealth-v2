import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './DoctorHome.css';

const DoctorHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/doctor/dashboard');
        setDashboard(res.data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dashboard:', err.response || err);
        setError('Không thể tải thông tin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="loading">Đang tải...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-home">
      <h2>Trang chủ Bác sĩ</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Lịch khám hôm nay</h3>
          <p>{dashboard.todayAppointments || 0}</p>
        </div>
        <div className="card">
          <h3>Tổng bệnh nhân</h3>
          <p>{dashboard.totalPatients || 0}</p>
        </div>
        <div className="card">
          <h3>Hồ sơ mới</h3>
          <p>{dashboard.newMedicalRecords || 0}</p>
        </div>
        <div className="card">
          <h3>Lịch trống trong tuần</h3>
          <p>{dashboard.availableSlots || 0}</p>
        </div>
      </div>

      <div className="welcome-message">
        <p>Chào mừng bạn trở lại! Hãy kiểm tra lịch khám và hồ sơ bệnh án của bệnh nhân hôm nay.</p>
      </div>
    </div>
  );
};

export default DoctorHome;
