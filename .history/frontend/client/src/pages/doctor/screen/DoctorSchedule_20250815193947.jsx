import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const doctorId = localStorage.getItem('userId'); // Giả sử lưu userId

  // Lấy lịch khám đã đặt
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/appointments/doctor', {
        params: { view: viewType },
      });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Lỗi khi lấy lịch khám:', err);
    } finally {
      setLoading(false);
    }
  }, [viewType]);

  // Lấy slot trống của bác sĩ
  const fetchAvailableSlots = useCallback(async () => {
    if (!doctorId || !viewDate) return;
    try {
      setLoadingSlots(true);
      const res = await axiosInstance.get(`/schedule/available/${doctorId}`, {
        params: { date: viewDate },
      });
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error('Lỗi khi lấy slot rảnh:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorId, viewDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

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

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Lịch làm việc của tôi</h2>
        <div className="view-buttons">
          <button onClick={() => setViewType('day')} className={viewType === 'day' ? 'active' : ''}>Hôm nay</button>
          <button onClick={() => setViewType('week')} className={viewType === 'week' ? 'active' : ''}>Cả tuần</button>
        </div>
      </div>

      <div className="date-navigation">
        <button onClick={handlePrevDay}>‹</button>
        <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
        <button onClick={handleNextDay}>›</button>
      </div>

      <div className="schedule-section">
        <h3>Lịch khám đã đặt</h3>
        {loading ? (
          <p>Đang tải lịch khám...</p>
        ) : appointments.length === 0 ? (
          <p>Không có lịch khám nào.</p>
        ) : (
          <ul className="schedule-list">
            {appointments
              .filter(appt => appt.date === viewDate)
              .map(appt => (
              <li key={appt._id} className="schedule-item">
                <strong>{appt.time}</strong> - {appt.patient?.fullName || 'Bệnh nhân'} – {appt.patient?.reason || 'Không rõ lý do'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="schedule-section">
        <h3>Slot trống</h3>
        {loadingSlots ? (
          <p>Đang tải slot trống...</p>
        ) : availableSlots.length === 0 ? (
          <p>Không còn slot rảnh trong ngày.</p>
        ) : (
          <ul className="schedule-list">
            {availableSlots.map((slot) => (
              <li key={slot} className="schedule-slot">{slot}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
  