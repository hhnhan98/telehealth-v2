import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // --- Lấy dữ liệu dashboard chung ---
        const resDashboard = await axios.get('/doctor-dashboard');
        const { todayAppointments: today = [], weeklyAppointmentsCount: weekCount = 0 } = resDashboard.data;
        setTodayAppointments(today);
        setWeeklyAppointmentsCount(weekCount);

        // --- Lấy lịch tuần chi tiết ---
        const resWeek = await axios.get('/doctor-dashboard/weekly-schedule');
        setWeeklySchedule(resWeek.data);

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

      {/* --- Card thống kê --- */}
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

export default DoctorDashboard;
