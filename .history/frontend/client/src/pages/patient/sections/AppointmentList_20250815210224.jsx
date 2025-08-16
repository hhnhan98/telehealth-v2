// frontend/client/src/components/appointments/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment, verifyAppointmentOtp } from '../../../services/bookingService';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpInput, setOtpInput] = useState({}); // lưu OTP cho từng appointment

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAppointments();
      setAppointments(data.appointments || data || []);
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

  const handleVerifyOtp = async (id) => {
    const otp = otpInput[id];
    if (!otp) return alert('Vui lòng nhập OTP');
    try {
      await verifyAppointmentOtp(id, otp);
      alert('Xác thực OTP thành công');
      loadAppointments(); // reload danh sách ngay sau khi xác thực
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Lỗi xác thực OTP');
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác thực';
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return status;
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
                <td>{renderStatus(appt.status)}</td>
                <td>
                  {appt.status === 'pending' && (
                    <>
                      <input
                        type="text"
                        placeholder="Nhập OTP"
                        value={otpInput[appt._id] || ''}
                        onChange={(e) =>
                          setOtpInput({ ...otpInput, [appt._id]: e.target.value })
                        }
                        style={{ width: '80px', marginRight: '5px' }}
                      />
                      <button onClick={() => handleVerifyOtp(appt._id)}>Xác thực</button>
                    </>
                  )}
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button onClick={() => handleCancel(appt._id)} className="cancel-btn" style={{ marginLeft: '5px' }}>
                      Hủy
                    </button>
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
