// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../../services';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.fetchDoctorDashboard(); // gọi từ object default
      console.log('--- Dashboard API response ---', res);

      const todayAppts = res?.data?.todayAppointments || [];
      setTodayAppointments(todayAppts);
      setTodayAppointmentsCount(todayAppts.length);
      setWeeklyAppointmentsCount(res?.data?.weeklyAppointmentsCount || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err.response || err);
      setError('Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <p>Đang tải dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Bác sĩ</h2>

      {/* --- Card thống kê --- */}
      <div className="dashboard-cards">
        <div className="card">
          <h4>Bệnh nhân hôm nay</h4>
          <p>{todayAppointmentsCount}</p>
        </div>
        <div className="card">
          <h4>Bệnh nhân tuần này</h4>
          <p>{weeklyAppointmentsCount}</p>
        </div>
      </div>

      {/* --- Bảng lịch hẹn hôm nay --- */}
      <h3>Lịch hẹn hôm nay</h3>
      {todayAppointments.length === 0 ? (
        <p>Chưa có lịch hẹn nào hôm nay</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Giờ khám</th>
              <th>Bệnh nhân</th>
              <th>Trạng thái</th>
              <th>Lí do khám</th>
            </tr>
          </thead>
          <tbody>
            {todayAppointments.map((appt) => (
              <tr key={appt._id}>
                <td>
                  {new Date(appt.datetime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  })}
                </td>
                <td>{appt.patient?.fullName || 'Không có thông tin'}</td>
                <td>{appt.status || 'Chưa xác nhận'}</td>
                <td>{appt.reason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorDashboard;
