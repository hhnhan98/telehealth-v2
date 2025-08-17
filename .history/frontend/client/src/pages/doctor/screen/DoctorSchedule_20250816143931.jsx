import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [dashboard, setDashboard] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  //const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch dashboard + tuần ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const dashRes = await axios.get('/doctor-dashboard');
      setDashboard(dashRes.data);

      const weekRes = await axios.get('/doctor-schedule/week');
      setWeekSchedule(weekRes.data);

      setError(null);
    } catch (err) {
      console.error('Lỗi tải dashboard:', err);
      setError('Không thể tải lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Patch status ---
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.patch(`/appointments/${id}/status`, { status });
      fetchData(); // refresh dữ liệu
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    }
  };

  // --- Day navigation ---
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

  if (loading) return <p>Đang tải lịch...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dashboard) return null;

  // --- Lọc dữ liệu ngày hiện tại ---
  const todaySchedule = weekSchedule.find(d => d.date.slice(0, 10) === viewDate);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Lịch làm việc bác sĩ</h2>
        <div className="view-buttons">
          <button
            className={viewType === 'day' ? 'active' : ''}
            onClick={() => setViewType('day')}
          >
            Hôm nay
          </button>
          <button
            className={viewType === 'week' ? 'active' : ''}
            onClick={() => setViewType('week')}
          >
            Cả tuần
          </button>
        </div>
      </div>

      {viewType === 'day' && (
        <div className="date-navigation">
          <button onClick={handlePrevDay}>‹</button>
          <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
          <button onClick={handleNextDay}>›</button>
        </div>
      )}

      {viewType === 'day' && todaySchedule && (
        <div className="schedule-section">
          <h3>Lịch hôm nay</h3>
          <ul className="schedule-list">
            {todaySchedule.slots.map((slot, i) => (
              <li key={i} className="schedule-item">
                <strong>{`${i + 8}:00`}</strong> - {slot?.patient?.fullName || 'Trống'}
                {slot && (
                  <div className="appointment-actions">
                    {slot.status !== 'confirmed' && (
                      <button onClick={() => updateAppointmentStatus(slot._id, 'confirmed')}>
                        Xác nhận
                      </button>
                    )}
                    {slot.status !== 'cancelled' && (
                      <button onClick={() => updateAppointmentStatus(slot._id, 'cancelled')}>
                        Hủy
                      </button>
                    )}
                  </div>
                )}
                {slot && <p>Trạng thái: {slot.status}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {viewType === 'week' && weekSchedule.length > 0 && (
        <div className="schedule-section">
          <h3>Lịch tuần</h3>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Giờ</th>
                {weekSchedule.map(day => (
                  <th key={day.date}>{new Date(day.date).toLocaleDateString('vi-VN')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                <tr key={hour}>
                  <td>{`${hour}:00`}</td>
                  {weekSchedule.map(day => (
                    <td key={day.date}>
                      {day.slots[hour - 8]?.patient?.fullName || 'Trống'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
