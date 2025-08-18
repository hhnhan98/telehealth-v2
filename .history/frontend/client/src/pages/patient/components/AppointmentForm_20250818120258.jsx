import React, { useEffect, useState, useRef } from 'react';
import {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  verifyOtp
} from '../../../services/bookingService';
import './AppointmentForm.css';

const AppointmentForm = ({ currentUser }) => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
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

  // -------------------------
  // Cache dropdown
  const specialtiesCache = useRef({});
  const doctorsCache = useRef({});

  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
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
  // Load locations
  useEffect(() => {
    fetchLocations()
      .then(res => setLocations(res.locations || []))
      .catch(() => showToast('Lỗi load cơ sở y tế', 'error'));
  }, []);

  // -------------------------
  // Load specialties when location changes
  useEffect(() => {
    setSpecialties([]);
    setDoctors([]);
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));

    if (!bookingData.location) return;

    // Check cache first
    if (specialtiesCache.current[bookingData.location]) {
      setSpecialties(specialtiesCache.current[bookingData.location]);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchSpecialties(bookingData.location, { signal: controller.signal })
      .then(res => {
        const list = res.specialties || [];
        setSpecialties(list);
        specialtiesCache.current[bookingData.location] = list;
      })
      .catch(err => {
        if (err.name !== 'AbortError') showToast('Lỗi load chuyên khoa', 'error');
      });

    return () => controller.abort();
  }, [bookingData.location]);

  // -------------------------
  // Load doctors when specialty changes
  useEffect(() => {
    setDoctors([]);
    setBookingData(prev => ({ ...prev, doctor: '' }));

    if (!bookingData.location || !bookingData.specialty) return;

    const key = `${bookingData.location}_${bookingData.specialty}`;
    if (doctorsCache.current[key]) {
      setDoctors(doctorsCache.current[key]);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchDoctors(bookingData.location, bookingData.specialty, { signal: controller.signal })
      .then(res => {
        const list = res.doctors || [];
        setDoctors(list);
        doctorsCache.current[key] = list;
      })
      .catch(err => {
        if (err.name !== 'AbortError') showToast('Lỗi load bác sĩ', 'error');
      });

    return () => controller.abort();
  }, [bookingData.location, bookingData.specialty]);

  // -------------------------
  // Load available times
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

  // -------------------------
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
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) {
      showToast('Vui lòng chọn đầy đủ thông tin khám.', 'error');
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
        locationId: bookingData.location,
        specialtyId: bookingData.specialty,
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
        location: '',
        specialty: '',
        doctor: '',
        date: '',
        time: '',
        patient: currentUser
          ? { ...prev.patient, reason: '' }
          : { fullName: '', gender: '', dob: '', phone: '', email: '', reason: '' }
      }));
      setSpecialties([]);
      setDoctors([]);
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
              <label>Cơ sở y tế <span className="required">*</span></label>
              <select value={bookingData.location} onChange={e => setBookingData(prev => ({ ...prev, location: e.target.value }))}>
                <option value="">Chọn cơ sở y tế</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Chuyên khoa <span className="required">*</span></label>
              <select value={bookingData.specialty} onChange={e => setBookingData(prev => ({ ...prev, specialty: e.target.value }))} disabled={!bookingData.location}>
                <option value="">Chọn chuyên khoa</option>
                {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bác sĩ <span className="required">*</span></label>
              <select value={bookingData.doctor} onChange={e => setBookingData(prev => ({ ...prev, doctor: e.target.value }))} disabled={!bookingData.specialty}>
                <option value="">Chọn bác sĩ</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày khám <span className="required">*</span></label>
              <input type="date" value={bookingData.date} onChange={e => setBookingData(prev => ({ ...prev, date: e.target.value }))} disabled={!bookingData.doctor} />
            </div>
            <div className="form-group">
              <label>Chọn giờ <span className="required">*</span></label>
              <select value={bookingData.time} onChange={e => setBookingData(prev => ({ ...prev, time: e.target.value }))} disabled={!bookingData.date}>
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
