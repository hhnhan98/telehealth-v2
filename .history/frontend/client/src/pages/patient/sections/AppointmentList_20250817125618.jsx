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

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

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

  const handleOtpChange = (id, value) => setOtpInputs(prev => ({ ...prev, [id]: value }));

  const handleVerifyOtp = async (id) => {
    const otp = otpInputs[id];
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

  const handleResendOtp = async (id) => {
    try {
      await resendOtp(id);
      showToast('OTP mới đã được gửi');
      let timer = 300; // 5 phút
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
        <div className="appointment-wrapper">
          {appointments.map(appt => (
            <div key={appt._id} className="appointment-card">
              <div className="card-row">
                <span className="card-label">Thời gian:</span>
                <span>{formatTime(appt.datetime)}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Cơ sở:</span>
                <span>{appt.location?.name || '-'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Chuyên khoa:</span>
                <span>{appt.specialty?.name || '-'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Bác sĩ:</span>
                <span>{appt.doctor?.fullName || '-'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Lý do khám:</span>
                <span>{appt.reason || '-'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Trạng thái:</span>
                <span>{renderStatus(appt.status)}</span>
              </div>
              <div className="card-row action-row">
                {appt.status === 'pending' && (
                  <>
                    <input
                      type="text"
                      placeholder="OTP"
                      value={otpInputs[appt._id] || ''}
                      onChange={e => handleOtpChange(appt._id, e.target.value)}
                      className="otp-input"
                    />
                    <button onClick={() => handleVerifyOtp(appt._id)} className="btn-otp">Xác thực</button>
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
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default AppointmentList;
