import React, { useEffect, useState, useRef } from 'react';
import {
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  verifyOtp
} from '../../../services/bookingService';
import './AppointmentForm.css';

const AppointmentForm = ({ currentUser }) => {
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const abortControllerRef = useRef(null);

  const [bookingData, setBookingData] = useState({
    doctor: '',
    date: '',
    time: '',
    patient: {
      fullName: '',
      gender: '',
      dob: '',
      phone: '',
      email: '',
      reason: ''
    }
  });

  // -------------------------
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  // -------------------------
  // Prefill patient info
  useEffect(() => {
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        patient: {
          fullName: currentUser.fullName || '',
          gender: currentUser.gender || '',
          dob: currentUser.dob ? currentUser.dob.slice(0, 10) : '',
          phone: currentUser.phone || '',
          email: currentUser.email || '',
          reason: prev.patient.reason || ''
        }
      }));
    }
  }, [currentUser]);

  // -------------------------
  // Load all doctors once (backend đã fix giờ hành chính)
  useEffect(() => {
    fetchDoctors()
      .then(res => setDoctors(res.doctors || []))
      .catch(() => showToast('Lỗi load danh sách bác sĩ', 'error'));
  }, []);

  // -------------------------
  // Load available times when doctor or date changes
  useEffect(() => {
    setAvailableTimes([]);
    setBookingData(prev => ({ ...prev, time: '' }));

    if (!bookingData.doctor || !bookingData.date) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchAvailableSlots(bookingData.doctor, bookingData.date, { signal: controller.signal })
      .then(res => setAvailableTimes(res.availableSlots || []))
      .catch(err => {
        if (err.name !== 'AbortError') setAvailableTimes([]);
      });

    return () => controller.abort();
  }, [bookingData.doctor, bookingData.date]);

  // -------------------------
  // OTP timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // -------------------------
  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      patient: { ...prev.patient, [name]: value }
    }));
  };

  const validateForm = () => {
    const { doctor, date, time, patient } = bookingData;
    if (!doctor || !date || !time) {
      showToast('Vui lòng chọn đầy đủ thông tin lịch khám.', 'error');
      return false;
    }
    if (!currentUser && (!patient.fullName || !patient.gender || !patient.dob)) {
      showToast('Vui lòng điền đầy đủ thông tin bệnh nhân.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingSubmit(true);
    try {
      const payload = {
        doctorId: bookingData.doctor,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.patient.reason,
        ...(currentUser?._id ? { patientId: currentUser._id } : { patient: bookingData.patient })
      };

      const res = await createAppointment(payload);
      setCreatedAppointmentId(res.appointment._id);
      setOtpStage(true);
      setOtpTimer(300); // 5 phút OTP
      setResendCooldown(30); // 30s trước khi gửi lại
      showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
    } catch (err) {
      console.error('Booking error:', err.response || err);
      showToast(err.response?.data?.error || 'Đặt lịch thất bại.', 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) return showToast('Vui lòng nhập OTP', 'error');

    setLoadingOtp(true);
    try {
      await verifyOtp(createdAppointmentId, otpInput);
      showToast('Xác thực OTP thành công. Lịch hẹn đã được xác nhận.', 'success');
      setOtpStage(false);
      setOtpInput('');
      setCreatedAppointmentId(null);
      setOtpTimer(0);
      setResendCooldown(0);
      setBookingData(prev => ({
        doctor: '',
        date: '',
        time: '',
        patient: currentUser
          ? { ...prev.patient, reason: '' }
          : { fullName: '', gender: '', dob: '', phone: '', email: '', reason: '' }
      }));
      setAvailableTimes([]);
    } catch (err) {
      console.error('OTP verification error:', err.response || err);
      showToast(err.response?.data?.error || 'Xác thực OTP thất bại.', 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!createdAppointmentId || resendCooldown > 0) return;
    setResendCooldown(30);
    setOtpTimer(300);
    try {
      await createAppointment({ resendOtpForId: createdAppointmentId });
      showToast('OTP đã được gửi lại.', 'success');
    } catch (err) {
      console.error('Resend OTP error:', err.response || err);
      showToast(err.response?.data?.error || 'Gửi lại OTP thất bại', 'error');
    }
  };

  const formatTimer = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------
  return (
    <div className="appointment-form-container">
      <h2 className="form-title">Đặt lịch khám bệnh</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {!otpStage ? (
        <form className="appointment-form-grid" onSubmit={handleSubmit}>
          {/* Thông tin lịch khám */}
          <div className="form-section">
            <h3>Thông tin lịch khám</h3>
            <div className="form-group">
              <label>Bác sĩ <span className="required">*</span></label>
              <select value={bookingData.doctor} onChange={e => setBookingData(prev => ({ ...prev, doctor: e.target.value }))}>
                <option value="">Chọn bác sĩ</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày khám <span className="required">*</span></label>
              <input type="date" value={bookingData.date} onChange={e => setBookingData(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Chọn giờ <span className="required">*</span></label>
              <select value={bookingData.time} onChange={e => setBookingData(prev => ({ ...prev, time: e.target.value }))}>
                <option value="">Chọn giờ khám</option>
                {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Thông tin bệnh nhân */}
          <div className="form-section">
            <h3>Thông tin bệnh nhân</h3>
            <div className="form-group">
              <input type="text" name="fullName" placeholder="Họ tên" value={bookingData.patient.fullName} onChange={handlePatientChange} required />
            </div>
            <div className="form-group">
              <select name="gender" value={bookingData.patient.gender} onChange={handlePatientChange} required>
                <option value="">Giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <input type="date" name="dob" value={bookingData.patient.dob} onChange={handlePatientChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="phone" placeholder="Số điện thoại" value={bookingData.patient.phone} onChange={handlePatientChange} />
            </div>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={bookingData.patient.email} onChange={handlePatientChange} />
            </div>
            <div className="form-group full-width">
              <textarea name="reason" placeholder="Lý do khám" value={bookingData.patient.reason} onChange={handlePatientChange} />
            </div>
          </div>

          <button type="submit" disabled={loadingSubmit}>
            {loadingSubmit ? 'Đang gửi...' : 'Đặt lịch'}
          </button>
        </form>
      ) : (
        <div className="otp-verification">
          <h3>Nhập mã OTP để xác nhận lịch hẹn</h3>
          <input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Mã OTP" />
          <div className="otp-actions">
            <button onClick={handleVerifyOtp} disabled={loadingOtp}>
              {loadingOtp ? 'Đang xác thực...' : 'Xác nhận OTP'}
            </button>
            <button onClick={handleResendOtp} disabled={resendCooldown > 0 || loadingOtp} className={resendCooldown > 0 ? 'disabled' : ''}>
              {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại OTP'}
            </button>
          </div>
          {otpTimer > 0 && <p className="otp-timer">OTP còn hiệu lực: {formatTimer(otpTimer)}</p>}
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;