import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment, verifyOtp } from '../../../services/bookingService';
import './AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpInputs, setOtpInputs] = useState({});
  const [otpStatus, setOtpStatus] = useState({}); // { [appointmentId]: 'success' | 'error' | '' }

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Load appointments error:', err);
      setError('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(id);
      alert('Hủy lịch hẹn thành công');
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Lỗi khi hủy lịch hẹn');
    }
  };

  const handleOtpChange = (appointmentId, value) => {
    setOtpInputs(prev => ({ ...prev, [appointmentId]: value }));
  };

  const handleVerifyOtp = async (appointmentId) => {
    const otp = otpInputs[appointmentId];
    if (!otp) {
      alert('Vui lòng nhập OTP');
      return;
    }

    try {
      await verifyOtp(appointmentId, otp);
      setOtpStatus(prev => ({ ...prev, [appointmentId]: 'success' }));
      alert('Xác thực OTP thành công');
      loadAppointments();
    } catch (err) {
      console.error(err);
      setOtpStatus(prev => ({ ...prev, [appointmentId]: 'error' }));
      alert(err?.response?.data?.error || 'OTP không chính xác hoặc đã hết hạn');
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
              <th>OTP / Hành động</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt._id}>
                <td>{new Date(`${appt.date}T${appt.time}`).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</td>
                <td>{appt.doctor?.fullName || 'Chưa có'}</td>
                <td>{appt.specialty?.name || 'Chưa có'}</td>
                <td>{appt.status}</td>
                <td>
                  {appt.status === 'pending' ? (
                    <div className="otp-container">
                      <input
                        type="text"
                        placeholder="Nhập OTP"
                        value={otpInputs[appt._id] || ''}
                        onChange={(e) => handleOtpChange(appt._id, e.target.value)}
                      />
                      <button onClick={() => handleVerifyOtp(appt._id)}>Xác thực</button>
                      {otpStatus[appt._id] === 'success' && <span className="success-text">✓ Xác thực</span>}
                      {otpStatus[appt._id] === 'error' && <span className="error-text">✗ Lỗi OTP</span>}
                    </div>
                  ) : appt.status === 'confirmed' ? (
                    <button onClick={() => handleCancel(appt._id)} className="cancel-btn">Hủy</button>
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
