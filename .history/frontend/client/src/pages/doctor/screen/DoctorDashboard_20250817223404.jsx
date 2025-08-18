import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctor/dashboard');
        console.log('--- Dashboard API response ---', res.data);

        setTodayAppointments(res.data.todayAppointments || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching today appointments:', err.response || err);
        setError('Không thể tải lịch hẹn hôm nay');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, []);

  if (loading) return <p className="loading">Đang tải lịch hẹn hôm nay...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-dashboard">
      <h2 className="dashboard-title">Lịch hẹn hôm nay</h2>
      {todayAppointments.length === 0 ? (
        <p>Chưa có lịch hẹn nào hôm nay</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Bệnh nhân</th>
              <th>Trạng thái</th>
              <th>Lí do khám</th>
            </tr>
          </thead>
          <tbody>
            {todayAppointments.map((appt) => (
              <tr key={appt._id}>
                <td>{new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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
