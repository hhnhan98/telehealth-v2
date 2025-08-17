import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [dashboard, setDashboard] = useState(null);
  const [viewType, setViewType] = useState('day');
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/doctor-dashboard');
      setDashboard(res.data || {});
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

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/appointments/${id}/status`, { status });
      fetchDashboard();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dashboard) return null;

  // --- Lấy lịch theo ngày, đảm bảo có slots ---
  const daySchedule = dashboard.weekSchedule?.find(d => d.date === viewDate) || { slots: [] };
  const weekSchedule = dashboard.weekSchedule || [];

  const renderSlot = (slot) => {
    const appt = slot?.appointment;
    const status = appt?.status || 'Trống';
    const className = appt
      ? status === 'pending' ? 'slot-pending'
        : status === 'confirmed' ? 'slot-confirmed'
        : 'slot-cancelled'
      : 'slot-empty';

    return (
      <div key={slot.time} className={`slot ${className}`}>
        <strong>{slot.time}</strong> - {appt?.patientName || 'Trống'}
        {appt && (
          <div className="appointment-actions">
            {status !== 'confirmed' && <button onClick={() => updateStatus(appt._id, 'confirmed')}>Xác nhận</button>}
            {status !== 'cancelled' && <button onClick={() => updateStatus(appt._id, 'cancelled')}>Hủy</button>}
          </div>
        )}
        <div className="slot-status">({status})</div>
      </div>
    );
  };

  return (
    <div className="schedule-container">
      <h2>Lịch làm việc của tôi</h2>

      <div className="view-buttons">
        <button className={viewType === 'day' ? 'active' : ''} onClick={() => setViewType('day')}>Hôm nay</button>
        <button className={viewType === 'week' ? 'active' : ''} onClick={() => setViewType('week')}>Cả tuần</button>
      </div>

      {viewType === 'day' && (
        <div className="date-navigation">
          <button onClick={handlePrevDay}>‹</button>
          <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
          <button onClick={handleNextDay}>›</button>
        </div>
      )}

      {viewType === 'day' && (
        <div className="schedule-section">
          <h3>Lịch khám hôm nay</h3>
          {daySchedule.slots?.length > 0
            ? daySchedule.slots.map(renderSlot)
            : <p>Chưa có lịch hôm nay</p>}
        </div>
      )}

      {viewType === 'week' && (
        <div className="schedule-section">
          <h3>Lịch tuần</h3>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số slot trống</th>
                <th>Lịch hẹn</th>
              </tr>
            </thead>
            <tbody>
              {weekSchedule.map(day => {
                const slots = day.slots || [];
                const freeCount = slots.filter(s => !s?.appointment).length;
                return (
                  <tr key={day.date}>
                    <td>{new Date(day.date).toLocaleDateString('vi-VN')}</td>
                    <td>{freeCount}/{slots.length}</td>
                    <td>
                      {slots.filter(s => s?.appointment).map(s => (
                        <div key={s.time}>
                          {s.time} - {s.appointment.patientName} ({s.appointment.status})
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
