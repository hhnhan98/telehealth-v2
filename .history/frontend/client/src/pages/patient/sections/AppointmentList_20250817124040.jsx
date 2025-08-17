import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment, verifyOtp, resendOtp } from '../../../services/bookingService';
import './AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpInputs, setOtpInputs] = useState({});
  const [otpStatus, setOtpStatus] = useState({});
  const [otpCountdown, setOtpCountdown] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  // Hiển thị toast
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  // Load danh sách lịch hẹn
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

  // Hủy lịch hẹn
  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công', 'success');
      loadAppointments();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error || 'Lỗi khi hủy lịch hẹn', 'error');
    }
  };

  // OTP
  const handleOtpChange = (appointmentId, value) => {
    setOtpInputs(prev => ({ ...prev, [appointmentId]: value }));
  };

  const handleVerifyOtp = async (appointmentId) => {
    const otp = otpInputs[appointmentId];
    if (!otp) return showToast('Vui lòng nhập OTP', 'error');
    try {
      await verifyOtp(appointmentId, otp);
      setOtpStatus(prev => ({ ...prev, [appointmentId]: 'success' }));
      setOtpInputs(prev => ({ ...prev, [appointmentId]: '' }));
      showToast('Xác thực OTP thành công', 'success');
      loadAppointments();
    } catch (err) {
      console.error(err);
      setOtpStatus(prev => ({ ...prev, [appointmentId]: 'error' }));
      showToast(err?.response?.data?.error || 'OTP không chính xác hoặc hết hạn', 'error');
    }
  };

  const handleResendOtp = async (appointmentId) => {
    try {
      await resendOtp(appointmentId);
      showToast('OTP mới đã gửi, vui lòng kiểm tra', 'success');
      setOtpCountdown(prev => ({ ...prev, [appointmentId]: 300 })); // 5 phút
    } catch (err) {
      console.error(err);
      showToast('Không thể gửi OTP', 'error');
    }
  };

  // Đếm ngược OTP
  useEffect(() => {
    const interval = setInterval(() => {
      setOtpCountdown(prev => {
        const updated = {};
        for (let key in prev) {
          if (prev[key] > 0) updated[key] = prev[key] - 1;
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderStatus = (status) => {
    switch (status) {
      case 'pending': return <span className="status pending">Chờ xác thực</span>;
      case 'confirmed': return <span className="status confirmed">Đã xác nhận</span>;
      case 'cancelled': return <span className="status cancelled">Đã hủy</span>;
      case 'completed': return <span className="status completed">Đã khám</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="appointment-list-container">
      <h2>Lịch sử đặt hẹn</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {loading ? <p className="loading">Đang tải...</p> :
        error ? <p className="error">{error}</p> :
          appointments.length === 0 ? <p>Chưa có lịch hẹn nào</p> :
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Cơ sở</th>
                  <th>Chuyên khoa</th>
                  <th>Bác sĩ</th>
                  <th>Lý do khám</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt._id}>
                    <td>{new Date(appt.datetime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td>{appt.location?.name || '-'}</td>
                    <td>{appt.specialty?.name || '-'}</td>
                    <td>{appt.doctor?.fullName || '-'}</td>
                    <td>{appt.reason || '-'}</td>
                    <td>{renderStatus(appt.status)}</td>
                    <td className="actions">
                      {appt.status === 'pending' && (
                        <>
                          <input type="text" placeholder="OTP" value={otpInputs[appt._id] || ''} onChange={e => handleOtpChange(appt._id, e.target.value)} />
                          <button onClick={() => handleVerifyOtp(appt._id)}>Xác thực</button>
                          <button disabled={otpCountdown[appt._id] > 0} onClick={() => handleResendOtp(appt._id)}>
                            {otpCountdown[appt._id] > 0 ? `Gửi lại (${otpCountdown[appt._id]}s)` : 'Gửi lại OTP'}
                          </button>
                        </>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'pending') && (
                        <button onClick={() => handleCancel(appt._id)}>Hủy</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      }
    </div>
  );
};

export default AppointmentList;
