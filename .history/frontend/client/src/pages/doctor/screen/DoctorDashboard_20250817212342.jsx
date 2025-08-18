import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        const res = await axios.get('/api/doctor/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Dashboard API response:', res.data);

        setTodayAppointments(res.data.todayAppointments || []);
        setRecentRecords(res.data.recentRecords || []);
        setTotalPatients(res.data.totalPatients || 0);
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
        <div className="card card-total">
          <h3>Tổng bệnh nhân</h3>
          <p>{totalPatients}</p>
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

      {/* --- Bảng 5 record gần đây --- */}
      <div className="recent-records">
        <h3>5 hồ sơ gần đây</h3>
        {recentRecords.length === 0 ? (
          <p>Chưa có hồ sơ nào gần đây</p>
        ) : (
          <table className="records-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Ngày tạo</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.patient?.fullName || 'Không có thông tin'}</td>
                  <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                  <td>{rec.notes || '-'}</td>
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
