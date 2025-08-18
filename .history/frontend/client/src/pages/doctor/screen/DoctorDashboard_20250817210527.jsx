// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctor-dashboard');

        // --- Xử lý todayAppointments ---
        let todayAppts = Array.isArray(res.data.todayAppointments)
          ? res.data.todayAppointments
          : res.data.todayAppointments?.appointments || [];

        // --- Xử lý weeklyAppointments ---
        let weeklyAppts = Array.isArray(res.data.weeklyAppointments)
          ? res.data.weeklyAppointments
          : [];

        let weekCount = typeof res.data.weeklyAppointmentsCount === 'number'
          ? res.data.weeklyAppointmentsCount
          : weeklyAppts.reduce(
              (acc, day) => acc + (day.slots?.filter(s => s.appointment != null).length || 0),
              0
            );

        setTodayAppointments(todayAppts);
        setWeeklyAppointments(weeklyAppts);
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

      {/* --- Thẻ thống kê nhanh --- */}
      <div className="cards">
        <div className="card card-today">
          <h3>Lịch hẹn hôm nay</h3>
          <p>{todayAppointments.length}</p>
        </div>
        <div className="card card-week">
          <h3>Lịch hẹn tuần này</h3>
          <p>{weeklyAppointmentsCount}</p>
        </div>
        <div className="card card-patients">
          <h3>Bệnh nhân mới hôm nay</h3>
          <p>{todayAppointments.filter(a => a.patient?.isNew).length}</p>
        </div>
      </div>

      {/* --- Bảng lịch hẹn hôm nay --- */}
      <div className="today-appointments">
        <h3>Lịch hẹn hôm nay</h3>
        {todayAppointments.length === 0 ? (
          <p>Không có lịch hẹn hôm nay</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Giờ khám</th>
                <th>Bệnh nhân</th>
                <th>Lý do khám</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((appt, index) => (
                <tr key={index}>
                  <td>{appt.time || appt.slotTime}</td>
                  <td>{appt.patient?.fullName || 'N/A'}</td>
                  <td>{appt.reason || '-'}</td>
                  <td>{appt.status || 'Chưa xác nhận'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- Biểu đồ lịch hẹn tuần --- */}
      <div className="weekly-chart">
        <h3>Lịch hẹn tuần</h3>
        {weeklyAppointments.length === 0 ? (
          <p>Không có dữ liệu tuần</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={weeklyAppointments.map(day => ({
                date: day.date,
                appointments: day.slots?.filter(s => s.appointment != null).length || 0
              }))}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
