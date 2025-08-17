import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [dashboard, setDashboard] = useState(null);
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch dashboard ---
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/doctor-dashboard'); // route backend
      setDashboard(res.data);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải dashboard:', err);
      setError('Không thể tải dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePrevDay = () => {
    const prev = new Date(viewDate);
    prev.setDate(prev.getDate() - 1);
    setViewDate(prev.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 1);
    setViewDate(next.toISOString().slice(0, 10));
  };

  // --- Cập nhật trạng thái appointment ---
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointments/${id}/status`, { status });
      fetchDashboard(); // refresh dữ liệu
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dashboard) return null;

  // --- Lọc lịch theo ngày nếu viewType === 'day' ---
  const daySchedule =
    dashboard.weekSchedule?.find(d => d.date === viewDate) || { appointments: [], freeSlots: [] };

  return (
    <div className="schedule-container">
      <h2>Lịch làm việc của tôi</h2>

      <div className="view-buttons">
        <button className={viewType === 'day' ? 'active' : ''} onClick={() => setViewType('day')}>
          Hôm nay
        </button>
        <button className={viewType === 'week' ? 'active' : ''} onClick={() => setViewType('week')}>
          Cả tuần
        </button>
      </div>

      {viewType === 'day' && (
        <div className="date-navigation">
          <button onClick={handlePrevDay}>‹</button>
          <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
          <button onClick={handleNextDay}>›</button>
        </div>
      )}

      <div className="schedule-section">
        <h3>Lịch khám</h3>
        {viewType === 'day' ? (
          daySchedule?.appointments?.length > 0 ? (
            <ul className="schedule-list">
              {daySchedule.appointments.map(appt => (
                <li key={appt._id} className="schedule-item">
                  <strong>
                    {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>{' '}
                  - {appt.patient?.fullName || 'Bệnh nhân'}
                  <div className="appointment-actions">
                    {appt.status !== 'confirmed' && (
                      <button onClick={() => updateStatus(appt._id, 'confirmed')}>Xác nhận</button>
                    )}
                    {appt.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(appt._id, 'cancelled')}>Hủy</button>
                    )}
                  </div>
                  <p>Trạng thái: {appt.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có lịch hôm nay</p>
          )
        ) : (
          // View tuần: bảng
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ trống</th>
                <th>Lịch hẹn</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.weekSchedule?.length > 0 ? (
                dashboard.weekSchedule.map(day => (
                  <tr key={day.date}>
                    <td>{new Date(day.date).toLocaleDateString('vi-VN')}</td>
                    <td>{day.freeSlots?.join(', ') || 'Hết slot'}</td>
                    <td>
                      {day.appointments?.length > 0 ? (
                        day.appointments.map(a => (
                          <div key={a._id}>
                            {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                            - {a.patient?.fullName || 'Bệnh nhân'}
                            {' '}
                            {a.status !== 'confirmed' && (
                              <button onClick={() => updateStatus(a._id, 'confirmed')}>Xác nhận</button>
                            )}
                            {a.status !== 'cancelled' && (
                              <button onClick={() => updateStatus(a._id, 'cancelled')}>Hủy</button>
                            )}
                            <span> ({a.status})</span>
                          </div>
                        ))
                      ) : (
                        'Không có'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>Chưa có dữ liệu lịch tuần</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {viewType === 'day' && (
        <div className="schedule-section">
          <h3>Slot trống hôm nay</h3>
          {daySchedule?.freeSlots?.length > 0 ? (
            <ul className="schedule-list">
              {daySchedule.freeSlots.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p>Hết slot</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
