import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './DoctorHome.css';

const DoctorHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/doctor-dashboard');
        setDashboard(res.data);
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

  if (loading) return <p>Đang tải dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-home">
      <h2>Dashboard bác sĩ</h2>

      <div className="cards">
        <div className="card">
          <h3>Lịch khám hôm nay</h3>
          <p>{dashboard.todayAppointments.length} lượt</p>
        </div>
        <div className="card">
          <h3>Tổng số bệnh nhân</h3>
          <p>{dashboard.totalPatients}</p>
        </div>
        <div className="card">
          <h3>Hồ sơ bệnh án mới (7 ngày)</h3>
          <p>{dashboard.recentRecordsCount}</p>
        </div>
      </div>

      <div className="appointments-list">
        <h3>Lịch khám hôm nay</h3>
        {dashboard.todayAppointments.length === 0 ? (
          <p>Chưa có lịch hôm nay</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.todayAppointments.map(appt => (
                <tr key={appt._id}>
                  <td>{new Date(appt.time).toLocaleTimeString()}</td>
                  <td>{appt.patient.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
