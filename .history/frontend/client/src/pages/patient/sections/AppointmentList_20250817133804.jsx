import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment, verifyOtp, resendOtp } from '../../../services/bookingService';
import './AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpInputs, setOtpInputs] = useState({});
  const [otpTimers, setOtpTimers] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  // Toast hiển thị
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công');
      loadAppointments();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error || 'Lỗi khi hủy lịch hẹn', 'error');
    }
  };

  // Handle OTP input
  const handleOtpChange = (id, value) => {
    setOtpInputs(prev => ({ ...prev, [id]: value }));
  };

  // Verify OTP
  const handleVerifyOtp = async (id) => {
    const otp = otpInputs[id];
    console.log('Verify OTP:', { id, otp }); 
    if (!otp) return showToast('Vui lòng nhập OTP', 'error');

    try {
      await verifyOtp(id, otp);
      showToast('Xác thực OTP thành công');
      setOtpInputs(prev => ({ ...prev, [id]: '' }));
      loadAppointments();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error || 'OTP không chính xác hoặc hết hạn', 'error');
    }
  };

  // Resend OTP với countdown
  const handleResendOtp = async (id) => {
    try {
      await resendOtp(id);
      showToast('OTP mới đã được gửi');
      let timer = 300; // 5 phút countdown
      setOtpTimers(prev => ({ ...prev, [id]: timer }));

      const interval = setInterval(() => {
        setOtpTimers(prev => {
          const newTime = prev[id] - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            return { ...prev, [id]: 0 };
          }
          return { ...prev, [id]: newTime };
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      showToast('Không thể gửi lại OTP', 'error');
    }
  };

  const formatTime = (datetime) => new Date(datetime).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const renderStatus = (status) => {
    switch (status) {
      case 'pending': return <span className="status pending">Chờ xác thực</span>;
      case 'confirmed': return <span className="status confirmed">Đã xác nhận</span>;
      case 'cancelled': return <span className="status cancelled">Đã hủy</span>;
      case 'completed': return <span className="status completed">Đã khám</span>;
      default: return <span>{status}</span>;
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds/60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <div className="appointment-list-container">
      <h2>Lịch sử lịch hẹn</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {loading ? <p>Đang tải...</p> :
        error ? <p className="error">{error}</p> :
        appointments.length === 0 ? <p>Chưa có lịch hẹn nào</p> :
        <div className="appointment-table-wrapper">
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
                  <td>{formatTime(appt.datetime)}</td>
                  <td>{appt.location?.name || '-'}</td>
                  <td>{appt.specialty?.name || '-'}</td>
                  <td>{appt.doctor?.fullName || '-'}</td>
                  <td>{appt.reason || '-'}</td>
                  <td>{renderStatus(appt.status)}</td>
                  <td>
                    {appt.status === 'pending' && (
                      <>
                        <input
                          type="text"
                          placeholder="OTP"
                          value={otpInputs[appt._id] || ''}
                          onChange={e => handleOtpChange(appt._id, e.target.value)}
                          className="otp-input"
                        />
                        <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">Xác thực</button>
                        <br />
                        <button
                          disabled={otpTimers[appt._id] > 0}
                          onClick={() => handleResendOtp(appt._id)}
                          className="btn-resend"
                        >
                          Gửi lại OTP {otpTimers[appt._id] > 0 ? `(${formatTimer(otpTimers[appt._id])})` : ''}
                        </button>
                      </>
                    )}
                    {(appt.status === 'pending' || appt.status === 'confirmed') &&
                      <button onClick={() => handleCancel(appt._id)} className="btn-cancel">Hủy</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default AppointmentList;
