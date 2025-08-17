// src/pages/patient/components/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { fetchAppointments, cancelAppointment, verifyOtp } from '../../../services/bookingService';
import './AppointmentList.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otpInputs, setOtpInputs] = useState({});
  const [otpStatus, setOtpStatus] = useState({});
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

  // Nhập OTP
  const handleOtpChange = (appointmentId, value) => {
    setOtpInputs(prev => ({ ...prev, [appointmentId]: value }));
  };

  // Xác thực OTP
  const handleVerifyOtp = async (appointmentId) => {
    const otp = otpInputs[appointmentId];
    if (!otp) {
      showToast('Vui lòng nhập OTP', 'error');
      return;
    }
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

  // Render trạng thái
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
      <h2>Danh sách lịch hẹn</h2>

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
              {appointments.map(appt => (
                <div key={appt._id} className="appointment-card">
                  <div className="appt-header">
                    <div className="appt-date">{new Date(appt.datetime).toLocaleString('vi-VN', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                    })}</div>
                    <div className="appt-status">{renderStatus(appt.status)}</div>
                  </div>
                  <div className="appt-body">
                    <p><strong>Cơ sở:</strong> {appt.location?.name || 'Chưa có'}</p>
                    <p><strong>Chuyên khoa:</strong> {appt.specialty?.name || 'Chưa có'}</p>
                    <p><strong>Bác sĩ:</strong> {appt.doctor?.fullName || 'Chưa có'}</p>
                    <p><strong>Lý do khám:</strong> {appt.reason || '-'}</p>
                  </div>
                  <div className="appt-actions">
                    {appt.status === 'pending' && (
                      <div className="otp-container">
                        <input type="text" placeholder="Nhập OTP" value={otpInputs[appt._id] || ''} onChange={e => handleOtpChange(appt._id, e.target.value)} />
                        <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">Xác thực</button>
                        {otpStatus[appt._id] === 'success' && <span className="success-text">✓ Xác thực</span>}
                        {otpStatus[appt._id] === 'error' && <span className="error-text">✗ Lỗi OTP</span>}
                      </div>
                    )}
                    {(appt.status === 'confirmed' || appt.status === 'pending') && (
                      <button onClick={() => handleCancel(appt._id)} className="btn-cancel">Hủy</button>
                    )}
                    {appt.status === 'completed' && <span className="completed-text">Đã khám</span>}
                  </div>
                </div>
              ))}
            </div>
      }
    </div>
  );
};

export default AppointmentList;
