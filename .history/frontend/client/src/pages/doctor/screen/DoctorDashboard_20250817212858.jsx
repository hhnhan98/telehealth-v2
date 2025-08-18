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
        const res = await axios.get('/doctor/dashboard');
        const { todayAppointments: today, recentRecords } = res.data;

        setTodayAppointments(today || []);
        // Sử dụng recentRecords để đếm lượt khám tuần này
        setWeeklyAppointmentsCount(Array.isArray(recentRecords) ? recentRecords.length : 0);
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

      {/* --- Card tổng quan --- */}
      <div className="cards">
        <div className="card card-today">
          <h3>Lịch hẹn hôm nay</h3>
          <p>{todayAppointments.length}</p>
        </div>
        <div className="card card-week">
          <h3>Tổng lượt khám tuần này</h3>
          <p>{weeklyAppointmentsCount}</p>
        </div>
      </div>

      {/* --- Lịch hẹn gần nhất --- */}
      <div className="today-appointments">
        <h3>Lịch hẹn gần nhất</h3>
        {todayAppointments.length === 0 ? (
          <p>Chưa có lịch hẹn hôm nay</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Bệnh nhân</th>
                <th>Lý do khám</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{appt.patient?.fullName || 'Không có thông tin'}</td>
                  <td>{appt.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
