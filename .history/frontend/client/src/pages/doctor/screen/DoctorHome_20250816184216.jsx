import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorHome.css';

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({
    todayAppointments: [],
    recentRecords: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctors/dashboard');
        const { todayAppointments = [], recentRecords = [] } = res.data;
        setDashboard({ todayAppointments, recentRecords });
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

  // Lọc danh sách bệnh nhân duy nhất hôm nay
  const uniquePatients = Array.from(
    new Map(dashboard.todayAppointments.map(a => [a.patient?._id, a.patient])).values()
  ).filter(Boolean);

  return (
    <div className="doctor-home">
      <h2 className="dashboard-title">Dashboard bác sĩ</h2>

      {/* Card thống kê nhanh */}
      <div className="cards">
        <div className="card card-patients">
          <h3>Bệnh nhân hôm nay</h3>
          <p>{uniquePatients.length}</p>
        </div>
        <div className="card card-appointments">
          <h3>Lịch hẹn hôm nay</h3>
          <p>{dashboard.todayAppointments.length}</p>
        </div>
        <div className="card card-medical-records">
          <h3>Hồ sơ bệnh án mới (7 ngày)</h3>
          <p>{dashboard.recentRecords.length}</p>
        </div>
      </div>

      {/* Danh sách lịch khám hôm nay */}
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
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.todayAppointments.map(appt => (
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
