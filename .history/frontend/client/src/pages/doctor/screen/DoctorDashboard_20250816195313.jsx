import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // --- Lấy dữ liệu dashboard từ BE ---
        const res = await axios.get('/doctor-dashboard');

        // --- Lấy danh sách lịch hôm nay ---
        const todayAppts = res.data.todayAppointments || [];

        // --- Lấy tổng số lịch tuần này ---
        const weekCount = res.data.weeklyAppointmentsCount || 0;

        setTodayAppointments(todayAppts);
        setWeeklyAppointmentsCount(weekCount);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dashboard:', err.response || err);
        setError('Không thể tải dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="loading">Đang tải dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-dashboard">
      <h2 className="dashboard-title">Dashboard bác sĩ</h2>

      <div className="cards">
        <div className="card card-today">
          <h3>Lịch hẹn hôm nay</h3>
          <p>{todayAppointments.length}</p>
        </div>
        <div className="card card-week">
          <h3>Lịch hẹn tuần này</h3>
          <p>{weeklyAppointmentsCount}</p>
        </div>
      </div>

      <div className="appointments-list">
        <h3>Chi tiết lịch hôm nay</h3>
        {todayAppointments.length === 0 ? (
          <p>Chưa có lịch hẹn hôm nay</p>
        ) : (
          <ul>
            {todayAppointments.map(appt => (
              <li key={appt._id}>
                {appt.time} - {appt.patient?.fullName} ({appt.status})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
