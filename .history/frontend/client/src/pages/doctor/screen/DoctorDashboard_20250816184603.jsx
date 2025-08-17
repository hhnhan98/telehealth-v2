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

        // --- Lấy lịch hôm nay ---
        const resToday = await axios.get('/doctor-dashboard');
        const { todayAppointments: today = [] } = resToday.data;
        setTodayAppointments(today);

        // --- Lấy lịch tuần ---
        const resWeek = await axios.get('/doctor-dashboard/weekly-schedule');
        setWeeklyAppointmentsCount(resWeek.data.reduce((acc, day) => acc + day.slots.filter(s => s !== null).length, 0));

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

      {/* --- Danh sách lịch khám hôm nay --- */}
      <div className="appointments-list">
        <h3>Lịch khám hôm nay</h3>
        {todayAppointments.length === 0 ? (
          <p>Chưa có lịch hôm nay</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map(appt => (
                <tr key={appt._id} className={`status-${appt.status || 'new'}`}>
                  <td>{appt.time || new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{appt.patient?.fullName || 'Chưa có tên'}</td>
                  <td>
                    {appt.status === 'confirmed'
                      ? 'Đã xác nhận'
                      : appt.status === 'cancelled'
                      ? 'Đã hủy'
                      : 'Mới'}
                  </td>
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
