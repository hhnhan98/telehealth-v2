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
                  <td>{appt.time || new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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

      {/* --- Lịch tuần chi tiết 7 ngày --- */}
      <div className="weekly-schedule">
        <h3>Lịch tuần (chi tiết theo slot)</h3>
        {weeklySchedule.length === 0 ? (
          <p>Chưa có lịch tuần</p>
        ) : (
          weeklySchedule.map(day => (
            <div key={day.date} className="day-schedule">
              <h4>{new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</h4>
              <div className="slots">
                {day.slots.map(slot => (
                  <span
                    key={slot.time}
                    className={`slot ${slot.appointment ? slot.appointment.status : 'empty'}`}
                    title={slot.appointment ? slot.appointment.patient.fullName : 'Trống'}
                  >
                    {slot.time}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
