import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import '../screen/DoctorHome.css';

const DoctorHome = () => {
  const [dashboard, setDashboard] = useState({
    todayAppointments: [],
    recentRecords: [],
    weekSchedule: [],
  });
  const [uniquePatientsCount, setUniquePatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctors/dashboard');
        const { todayAppointments = [], recentRecords = [] } = res.data;

        // Tính số bệnh nhân hôm nay duy nhất
        const uniquePatients = Array.from(
          new Map(todayAppointments.map(a => [a.patient?._id, a.patient])).values()
        ).filter(Boolean);

        setUniquePatientsCount(uniquePatients.length);
        setDashboard({ ...res.data });
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
    <div className="doctor-home">
      <h2 className="dashboard-title">Dashboard bác sĩ</h2>

      {/* Card thống kê nhanh */}
      <div className="cards">
        <div className="card card-patients">
          <h3>Bệnh nhân hôm nay</h3>
          <p>{uniquePatientsCount}</p>
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
              {dashboard.todayAppointments.map(appt => {
                const time = new Date(appt.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const statusLabel =
                  appt.status === 'confirmed'
                    ? 'Đã xác nhận'
                    : appt.status === 'cancelled'
                    ? 'Đã hủy'
                    : 'Mới';

                return (
                  <tr key={appt._id} className={`status-${appt.status}`}>
                    <td>{time}</td>
                    <td>{appt.patient?.fullName || 'Chưa có tên'}</td>
                    <td>{statusLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
