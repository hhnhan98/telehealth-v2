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
        const res = await axios.get('/-dashboard');
        console.log('Dashboard API response:', res.data);

        const todayAppts = Array.isArray(res.data.todayAppointments)
          ? res.data.todayAppointments
          : res.data.todayAppointments?.appointments || [];

        const weekCount = typeof res.data.weeklyAppointmentsCount === 'number'
          ? res.data.weeklyAppointmentsCount
          : Array.isArray(res.data.weeklyAppointments)
            ? res.data.weeklyAppointments.reduce(
                (acc, day) => acc + (day.slots?.filter(s => s.appointment != null).length || 0),
                0doctor
              )
            : 0;

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

      {/* --- Thẻ tổng quan --- */}
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

      {/* --- Bảng lịch hẹn hôm nay --- */}
      <div className="today-appointments">
        <h3>Lịch hẹn hôm nay</h3>
        {todayAppointments.length === 0 ? (
          <p>Chưa có lịch hẹn nào hôm nay</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Bệnh nhân</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{appt.time}</td>
                  <td>{appt.patient?.fullName || 'Không có thông tin'}</td>
                  <td>{appt.status || 'Chưa xác nhận'}</td>
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
