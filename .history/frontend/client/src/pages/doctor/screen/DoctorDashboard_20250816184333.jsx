import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorDashboard.css';

const STATUS_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Mới', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({
    todayAppointments: [],
    totalPatients: 0,
    recentRecordsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & search state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Lấy dữ liệu dashboard ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctor-dashboard');
        const { todayAppointments = [], totalPatients = 0, recentRecordsCount = 0 } = res.data;
        setDashboard({ todayAppointments, totalPatients, recentRecordsCount });
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

  // --- Lọc bệnh nhân duy nhất hôm nay ---
  const uniquePatients = Array.from(
    new Map(dashboard.todayAppointments.map(a => [a.patient?._id, a.patient])).values()
  ).filter(Boolean);

  // --- Áp dụng filter trạng thái & tìm kiếm ---
  const filteredAppointments = dashboard.todayAppointments
    .filter(appt => statusFilter === 'all' || appt.status === statusFilter)
    .filter(appt => 
      appt.patient?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = a.time ? a.time : new Date(a.date).toISOString();
      const timeB = b.time ? b.time : new Date(b.date).toISOString();
      return timeA.localeCompare(timeB);
    });

  return (
    <div className="doctor-dashboard">
      <h2 className="dashboard-title">Dashboard bác sĩ</h2>

      {/* --- Card thống kê nhanh --- */}
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
          <p>{dashboard.recentRecordsCount}</p>
        </div>
        <div className="card card-total-patients">
          <h3>Tổng bệnh nhân</h3>
          <p>{dashboard.totalPatients}</p>
        </div>
      </div>

      {/* --- Bộ lọc & tìm kiếm --- */}
      <div className="dashboard-filters">
        <div className="filter-status">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={statusFilter === f.value ? 'active' : ''}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="filter-search">
          <input
            type="text"
            placeholder="Tìm theo tên bệnh nhân..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- Danh sách lịch khám hôm nay --- */}
      <div className="appointments-list">
        <h3>Lịch khám hôm nay</h3>
        {filteredAppointments.length === 0 ? (
          <p>Không có lịch phù hợp</p>
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
              {filteredAppointments.map(appt => (
                <tr key={appt._id} className={`status-${appt.status || 'new'}`}>
                  <td>
                    {appt.time || new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
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
