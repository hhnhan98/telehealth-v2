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

        // --- Gọi API dashboard BE ---
        const res = await axios.get('/doctor-dashboard');

        // --- Debug dữ liệu BE trả về ---
        console.log('Dashboard API response:', res.data);

        // --- Xử lý todayAppointments ---
        let todayAppts = [];
        if (Array.isArray(res.data.todayAppointments)) {
          todayAppts = res.data.todayAppointments;
        } else if (Array.isArray(res.data.todayAppointments?.appointments)) {
          todayAppts = res.data.todayAppointments.appointments;
        }

        // --- Xử lý weeklyAppointmentsCount ---
        let weekCount = 0;
        if (typeof res.data.weeklyAppointmentsCount === 'number') {
          weekCount = res.data.weeklyAppointmentsCount;
        } else if (Array.isArray(res.data.weeklyAppointments)) {
          // Nếu BE trả mảng lịch tuần
          weekCount = res.data.weeklyAppointments.reduce(
            (acc, day) => acc + (day.slots?.filter(s => s.appointment != null).length || 0),
            0
          );
        }

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
    </div>
  );
};

export default DoctorDashboard;
