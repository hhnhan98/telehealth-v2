// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import bookingService from '../../../services/bookingService'; // Import trực tiếp
//import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      
      if (typeof bookingService.fetchDoctorDashboard !== 'function') {
        throw new Error('fetchDoctorDashboard is not available');
      }
      
      const res = await bookingService.fetchDoctorDashboard();

      if (res && res.success) {
        const todayAppts = res.data?.todayAppointments || [];
        setTodayAppointments(todayAppts);
        setTodayAppointmentsCount(todayAppts.length);
        setWeeklyAppointmentsCount(res.data?.weeklyAppointmentsCount || 0);
        setError(null);
      } else {
        throw new Error(res?.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="error-state">
        <h3>Lỗi</h3>
        <p>{error}</p>
        <button onClick={loadDashboard} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Bác sĩ</h2>

      {/* Card thống kê */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="card-icon">👨‍⚕️</div>
          <div className="card-content">
            <h4>Bệnh nhân hôm nay</h4>
            <p className="stat-number">{todayAppointmentsCount}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="card-icon">📅</div>
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
                  <tr key={appt._id || appt.id} className="appointment-row">
                    <td className="time-cell">
                      {new Date(appt.datetime).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })}
                    </td>
                    <td className="patient-cell">
                      {appt.patient?.fullName || 'Không có thông tin'}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${appt.status || 'pending'}`}>
                        {appt.status || 'Chưa xác nhận'}
                      </span>
                    </td>
                    <td className="reason-cell">
                      {appt.reason || '-'}
                    </td>
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