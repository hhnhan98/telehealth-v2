import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc nâng cao
  const [filter, setFilter] = useState({
    status: 'all',      // pending, confirmed, cancelled
    dateFrom: '',
    dateTo: '',
  });

  // Lấy lịch hẹn từ backend
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = '/doctors/work-schedule?view=week';

      const res = await axios.get(url);
      setAppointments(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err.response || err);
      setError('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p className="loading">Đang tải lịch hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  // --- Lọc theo filter nâng cao ---
  const filteredAppointments = appointments
    .flatMap(day => day.appointments) // flatten tuần thành mảng appointments
    .filter(appt => {
      let match = true;
      if (filter.status !== 'all') match = appt.status === filter.status;
      if (filter.dateFrom) match = match && new Date(appt.date) >= new Date(filter.dateFrom);
      if (filter.dateTo) match = match && new Date(appt.date) <= new Date(filter.dateTo);
      return match;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // sắp xếp thời gian tăng dần

  return (
    <div className="doctor-schedule">
      <h2>Lịch khám bác sĩ</h2>

      {/* Bộ lọc nâng cao */}
      <div className="filter">
        <label>
          Trạng thái:
          <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </label>
        <label>
          Từ ngày:
          <input type="date" value={filter.dateFrom} onChange={e => setFilter({...filter, dateFrom: e.target.value})}/>
        </label>
        <label>
          Đến ngày:
          <input type="date" value={filter.dateTo} onChange={e => setFilter({...filter, dateTo: e.target.value})}/>
        </label>
      </div>

      {/* Danh sách lịch hẹn */}
      {filteredAppointments.length === 0 ? (
        <p>Chưa có lịch hẹn nào phù hợp</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Bệnh nhân</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appt => (
              <tr key={appt._id} className={`status-${appt.status || 'new'}`}>
                <td>{new Date(appt.date).toLocaleDateString()}</td>
                <td>{new Date(appt.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</td>
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
  );
};

export default DoctorSchedule;
