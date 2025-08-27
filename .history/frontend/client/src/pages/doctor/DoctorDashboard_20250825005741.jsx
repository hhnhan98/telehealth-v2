// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import doctorService from '../../services/doctorService';
import './styles/DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorService.fetchDashboard();
      if (res && res.success) {
        setTodayAppointments(res.data.todayAppointments || []);
        setWeeklyAppointmentsCount(res.data.weeklyAppointmentsCount || 0);
        setError(null);
      } else {
        throw new Error(res?.message || 'Không thể tải dữ liệu dashboard');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="loading-state">
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Lỗi</h3>
        <p>{error}</p>
        <button onClick={loadDashboard}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Bác sĩ</h2>

      {/* Card thống kê */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="card-content">
            <h4>Bệnh nhân hôm nay</h4>
            <p className="stat-number">{todayAppointments.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-content">
            <h4>Bệnh nhân tuần này</h4>
            <p className="stat-number">{weeklyAppointmentsCount}</p>
          </div>
        </div>
      </div>

      {/* Bảng lịch hẹn hôm nay */}
      <div className="appointments-section">
        <h3>Lịch hẹn hôm nay</h3>

        {todayAppointments.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có lịch hẹn nào hôm nay</p>
          </div>
        ) : (
          <div className="table-container">
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
                    <td>{appt.patient?.fullName || '-'}</td>
                    <td>
                      <span className={`status-badge status-${appt.status || 'pending'}`}>
                        {appt.status || 'pending'}
                      </span>
                    </td>
                    <td>{appt.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
