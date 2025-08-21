// src/pages/patient/AppointmentDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services';
import '../../styles/global.css';

const STATUS_LABELS = {
  pending: 'Chờ xác thực',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã khám'
};

const STATUS_CLASSES = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed'
};

const formatTime = (datetime) =>
  new Date(datetime).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = useCallback((message, type='success', duration=3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  }, []);

  const loadDetail = useCallback(async () => {
    try {
      const res = await bookingService.getAppointmentById(id);
      setAppointment(res);
    } catch (err) {
      console.error('Load detail error:', err.message || err);
      showToast('Không tải được chi tiết lịch hẹn', 'error');
    }
  }, [id, showToast]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await bookingService.cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công');
      navigate('/appointments');
    } catch (err) {
      console.error('Cancel appointment error:', err.message || err);
      showToast('Lỗi khi hủy lịch hẹn', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showToast('Vui lòng nhập OTP', 'error');
    try {
      const res = await bookingService.verifyOtp(id, otp);
      if (res?.success) {
        showToast('Xác thực OTP thành công');
        setAppointment(prev => ({ ...prev, status: 'confirmed' }));
        setOtp('');
      } else {
        showToast(res?.message || 'Xác thực OTP thất bại', 'error');
      }
    } catch {
      showToast('OTP không chính xác hoặc hết hạn', 'error');
    }
  };

  const handleResendOtp = async () => {
    try {
      await bookingService.resendOtp(id);
      showToast('OTP mới đã được gửi');
      setTimer(300);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      showToast('Gửi lại OTP thất bại', 'error');
    }
  };

  if (!appointment) return <p>Đang tải chi tiết...</p>;

  return (
    <div className="appointment-detail-container">
      <h2>Chi tiết lịch hẹn</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      <p><strong>Thời gian:</strong> {formatTime(appointment.datetime)}</p>
      <p><strong>Cơ sở:</strong> {appointment.location?.name}</p>
      <p><strong>Bác sĩ:</strong> {appointment.doctor?.fullName}</p>
      <p><strong>Lý do khám:</strong> {appointment.reason}</p>
      <p><strong>Trạng thái:</strong> 
        <span className={`status ${STATUS_CLASSES[appointment.status]}`}>{STATUS_LABELS[appointment.status]}</span>
      </p>

      {appointment.status === 'pending' && (
        <div className="otp-section">
          <input
            type="text"
            placeholder="Nhập OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="otp-input"
          />
          <button onClick={handleVerifyOtp} className="btn-verify">Xác thực</button>
          <br />
          <button
            disabled={timer > 0}
            onClick={handleResendOtp}
            className={`btn-resend ${timer>0?'disabled':''}`}
          >
            Gửi lại OTP {timer>0 ? `(${formatTimer(timer)})` : ''}
          </button>
        </div>
      )}

      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <button onClick={handleCancel} className="btn-cancel">Hủy lịch hẹn</button>
      )}
    </div>
  );
};

export default AppointmentDetail;
