import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [loading, setLoading] = useState(true);

  // Hàm lấy lịch khám của bác sĩ
  const fetchAppointments = async () => {
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
  };

  // useEffect gọi khi viewType thay đổi
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, viewType]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Lịch làm việc của tôi</h2>
        <div className="view-buttons">
          <button
            onClick={() => setViewType('day')}
            className={viewType === 'day' ? 'active' : ''}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setViewType('week')}
            className={viewType === 'week' ? 'active' : ''}
          >
            Cả tuần
          </button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải lịch khám...</p>
      ) : appointments.length === 0 ? (
        <p>Không có lịch khám nào.</p>
      ) : (
        <ul className="schedule-list">
          {appointments.map((appt) => (
            <li key={appt._id} className="schedule-item">
              <strong>
                {new Date(`${appt.date}T${appt.time || '00:00'}`).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </strong>{' '}
              - {appt.patient?.fullName || 'Bệnh nhân'} – {appt.patient?.reason || 'Không rõ lý do'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorSchedule;
