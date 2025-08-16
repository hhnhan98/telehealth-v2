// src/pages/patient/sections/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment } from '../../../services/bookingService';
import './AppointmentList.css'; // chắc chắn file CSS tồn tại

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load danh sách lịch hẹn
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Load appointments error:', err);
      setError('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Hủy lịch hẹn
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(appointmentId);
      alert('Hủy lịch hẹn thành công');
      loadAppointments(); // refresh danh sách sau khi hủy
    } catch (err) {
      console.error('Cancel appointment error:', err);
      alert(err.message || 'Lỗi khi hủy lịch hẹn');
    }
  };

  return (
    <div className="appointment-list-container">
      <h2>Danh sách lịch hẹn</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : appointments.length === 0 ? (
        <p>Chưa có lịch hẹn nào</p>
      ) : (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Ngày & giờ</th>
              <th>Bác sĩ</th>
              <th>Chuyên khoa</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>
                  {new Date(`${appt.date}T${appt.time}`).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td>{appt.doctor?.fullName || 'Chưa có'}</td>
                <td>{appt.specialty?.name || 'Chưa có'}</td>
                <td>{appt.status}</td>
                <td>
                  {appt.status === 'confirmed' ? (
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppointmentList;
