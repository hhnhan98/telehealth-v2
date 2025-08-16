import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        console.error('Không có token');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('/api/appointments/doctor', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            view: viewType,
          },
        });
        // ✅ Lấy mảng appointments đúng key
        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error('Lỗi khi lấy lịch khám:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [viewType, token]);

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
                {new Date(appt.date).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </strong>{' '}
              - {appt.patient?.fullName || 'Bệnh nhân'} –{' '}
              {appt.reason || 'Không rõ lý do'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorSchedule;