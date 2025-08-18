import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';
import { FaCalendarDay, FaCalendarWeek, FaUserMd } from 'react-icons/fa';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctor/dashboard');
        const todayAppts = res.data.todayAppointments || [];
        const weekCount = res.data.weeklyAppointmentsCount || 0;

        setTodayAppointments(todayAppts);
        setWeeklyAppointmentsCount(weekCount);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard:', err.response || err);
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

      {/* --- Cards tổng quan --- */}
      <div className="cards">
        <div className="card card-today">
          <div className="card-icon"><FaCalendarDay size={24} /></div>
          <div className="card-info">
            <h3>Lịch hẹn hôm nay</h3>
            <p>{todayAppointments.length}</p>
          </div>
        </div>
        <div className="card card-week">
          <div className="card-icon"><FaCalendarWeek size={24} /></div>
          <div className="card-info">
            <h3>Tổng lượt khám tuần này</h3>
            <p>{weeklyAppointmentsCount}</p>
          </div>
        </div>
      </div>

      {/* --- Timeline lịch hẹn hôm nay --- */}
      <div className="today-appointments">
        <h3>Lịch hẹn hôm nay</h3>
        {todayAppointments.length === 0 ? (
          <p>Chưa có lịch hẹn hôm nay</p>
        ) : (
          <div className="appointments-timeline">
            {todayAppointments.map((appt) => (
              <div key={appt._id} className="appointment-card">
                <div className="appt-time">{new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="appt-info">
                  <p className="appt-patient"><FaUserMd /> {appt.patient?.fullName || 'Không có thông tin'}</p>
                  <p className="appt-reason">{appt.reason || '-'}</p>
                  <p className="appt-status">{appt.status || 'Chưa xác nhận'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
