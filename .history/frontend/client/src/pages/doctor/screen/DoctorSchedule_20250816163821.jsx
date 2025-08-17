import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeekSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/doctors/dashboard');
      setWeekSchedule(res.data.weekSchedule || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải lịch tuần:', err.response || err);
      setError('Không thể tải lịch tuần');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekSchedule();
  }, []);

  const updateStatus = async (apptId, newStatus) => {
    try {
      await axios.patch(`/doctors/appointment/${apptId}`, { status: newStatus });
      fetchWeekSchedule(); // reload sau khi cập nhật
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err.response || err);
      alert('Không thể cập nhật trạng thái');
    }
  };

  if (loading) return <p className="loading">Đang tải lịch tuần...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-schedule">
      <h2>Lịch làm việc tuần</h2>
      <div className="week-grid">
        {weekSchedule.map(day => (
          <div className="day-column" key={day.date}>
            <h3>{new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</h3>
            
            <div className="slots">
              {day.freeSlots.map(slot => (
                <div key={slot} className="slot free">{slot}</div>
              ))}
              {day.appointments.map(appt => (
                <div key={appt._id} className={`slot booked status-${appt.status}`}>
                  <div className="appt-info">
                    <strong>{appt.patient?.fullName || 'Chưa có tên'}</strong>
                    <span>{appt.time || new Date(appt.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="appt-actions">
                    {appt.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(appt._id, 'confirmed')}>Xác nhận</button>
                        <button onClick={() => updateStatus(appt._id, 'cancelled')}>Hủy</button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => updateStatus(appt._id, 'cancelled')}>Hủy</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorSchedule;
