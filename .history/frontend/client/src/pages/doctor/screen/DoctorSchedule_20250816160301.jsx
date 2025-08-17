import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const STATUS_COLORS = {
  pending: '#FFD700',    // vàng
  confirmed: '#4CAF50',  // xanh
  cancelled: '#F44336',  // đỏ
  free: '#E0E0E0'        // xám
};

// Component con cho mỗi slot
const Slot = ({ slot, onUpdate }) => {
  const color = STATUS_COLORS[slot.status || 'free'];

  return (
    <div className="slot-item" style={{ backgroundColor: color }}>
      <span>{slot.time}</span>
      {slot.patient && <span> - {slot.patient.fullName}</span>}
      {slot.patient && slot.status !== 'confirmed' && (
        <button onClick={() => onUpdate(slot._id, 'confirmed')}>Xác nhận</button>
      )}
      {slot.patient && slot.status !== 'cancelled' && (
        <button onClick={() => onUpdate(slot._id, 'cancelled')}>Hủy</button>
      )}
      {slot.patient && <span> ({slot.status})</span>}
    </div>
  );
};

const DoctorSchedule = () => {
  const [viewType, setViewType] = useState('day');
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/doctors/work-schedule?view=${viewType}&date=${viewDate}`);
      setWeekSchedule(res.data.weekSchedule || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải lịch:', err);
      setError('Không thể tải lịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [viewType, viewDate]);

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
      await axios.patch(`/api/appointments/${id}/status`, { status });
      fetchSchedule();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error">{error}</p>;

  // Lọc slots cho day view
  const daySlots = viewType === 'day'
    ? weekSchedule.find(d => d.date === viewDate)?.appointments || []
    : [];

  return (
    <div className="doctor-schedule-container">
      <h2>Lịch làm việc của tôi</h2>

      <div className="view-buttons">
        <button className={viewType==='day'?'active':''} onClick={()=>setViewType('day')}>Hôm nay</button>
        <button className={viewType==='week'?'active':''} onClick={()=>setViewType('week')}>Cả tuần</button>
      </div>

      {viewType==='day' && (
        <div className="date-navigation">
          <button onClick={handlePrevDay}>‹</button>
          <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
          <button onClick={handleNextDay}>›</button>
        </div>
      )}

      {viewType==='day' ? (
        <div className="slots-container">
          {daySlots.length === 0
            ? <p>Chưa có lịch hôm nay</p>
            : daySlots.map(slot => (
                <Slot key={slot._id} slot={slot} onUpdate={updateStatus} />
              ))
          }
        </div>
      ) : (
        <div className="week-schedule">
          {weekSchedule.map(day => (
            <div key={day.date} className="day-block">
              <h4>{new Date(day.date).toLocaleDateString('vi-VN')}</h4>
              {day.appointments.length === 0
                ? <p>Không có lịch</p>
                : day.appointments.map(slot => (
                    <Slot key={slot._id} slot={slot} onUpdate={updateStatus} />
                  ))
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
