import React, { useState, useEffect, useCallback, useRef } from 'react';
import bookingService from '../../services/bookingService';
import './styles/AppointmentForm.css';
import dayjs from 'dayjs';
import { formatVN } from '../../utils/timezone';

const AppointmentForm = ({ currentUser }) => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    patient: { reason: '' },
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const specialtiesCache = useRef({});
  const doctorsCache = useRef({});
  const today = new Date().toISOString().split('T')[0];

  const showToast = useCallback(msg => alert(msg), []);

  // Load Locations
  useEffect(() => {
    (async () => {
      try {
        const res = await bookingService.fetchLocations();
        setLocations(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error(err);
        showToast('Lỗi load cơ sở y tế');
      }
    })();
  }, [showToast]);

  // Load Specialties
  const loadSpecialties = useCallback(async (locationId) => {
    if (!locationId) return setSpecialties([]);
    if (specialtiesCache.current[locationId]) {
      setSpecialties(specialtiesCache.current[locationId]);
      return;
    }
    try {
      const res = await bookingService.fetchSpecialties(locationId);
      const list = Array.isArray(res) ? res : [];
      setSpecialties(list);
      specialtiesCache.current[locationId] = list;
    } catch (err) {
      console.error(err);
      showToast('Lỗi load chuyên khoa');
      setSpecialties([]);
    }
  }, [showToast]);

  useEffect(() => {
    setSpecialties([]);
    setDoctors([]);
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    if (bookingData.location) loadSpecialties(bookingData.location);
  }, [bookingData.location, loadSpecialties]);

  // Load Doctors
  const loadDoctors = useCallback(async () => {
    if (!bookingData.location || !bookingData.specialty) return setDoctors([]);
    const key = `${bookingData.location}_${bookingData.specialty}`;
    if (doctorsCache.current[key]) {
      setDoctors(doctorsCache.current[key]);
      return;
    }
    try {
      const res = await bookingService.fetchDoctors(bookingData.location, bookingData.specialty);
      const list = Array.isArray(res) ? res : [];
      setDoctors(list);
      doctorsCache.current[key] = list;
    } catch (err) {
      console.error(err);
      showToast('Lỗi load bác sĩ');
      setDoctors([]);
    }
  }, [bookingData.location, bookingData.specialty, showToast]);

  useEffect(() => {
    setDoctors([]);
    setBookingData(prev => ({ ...prev, doctor: '' }));
    loadDoctors();
  }, [bookingData.location, bookingData.specialty, loadDoctors]);

  // Load Available Slots
  const loadAvailableSlots = useCallback(async () => {
    if (!bookingData.doctor || !bookingData.date) {
      setAvailableTimes([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await bookingService.fetchAvailableSlots(bookingData.doctor, bookingData.date);
      const slots = Array.isArray(res) ? res : (res?.data?.availableSlots || []);
      const normalized = slots.map(slot => {
        const timeStr = typeof slot === 'string' ? slot : slot.time || '';
        const datetimeVN = slot.datetimeVN ? formatVN(slot.datetimeVN) : formatVN(timeStr);
        const displayTime = dayjs(datetimeVN).format('HH:mm');
        return { time: timeStr, displayTime, datetimeVN };
      });
      setAvailableTimes(normalized);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách giờ khám.');
      setAvailableTimes([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData.doctor, bookingData.date, showToast]);

  useEffect(() => {
    setAvailableTimes([]);
    setBookingData(prev => ({ ...prev, time: '' }));
    loadAvailableSlots();
  }, [bookingData.doctor, bookingData.date, loadAvailableSlots]);

  // OTP timers
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handlers
  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, patient: { ...prev.patient, [name]: value } }));
  };

  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) {
      showToast('Vui lòng bổ sung đầy đủ thông tin khám.');
      return false;
    }
    if (!patient.reason) {
      showToast('Vui lòng nhập lý do khám.');
      return false;
    }
    if (!availableTimes || availableTimes.length === 0) {
      showToast('Không còn slot trống cho ngày này.');
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
        time: bookingData.time, // gửi string "HH:mm"
        reason: bookingData.patient.reason
      };
      const res = await bookingService.createAppointment(payload);
      const appointmentId = res?.data?.appointment?._id;
      if (!appointmentId) throw new Error('Không thể đặt lịch ở quá khứ ');

      setCreatedAppointmentId(appointmentId);
      localStorage.setItem('tempAppointmentId', appointmentId);
      setOtpStage(true);
      setOtpTimer(300);
      setResendCooldown(30);
      showToast('Đặt lịch thành công! OTP đã gửi vui lòng kiểm tra email.');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Đặt lịch thất bại.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) return showToast('Vui lòng nhập OTP');
    const appointmentId = createdAppointmentId || localStorage.getItem('tempAppointmentId');
    if (!appointmentId) return showToast('Lỗi: Không tìm thấy thông tin lịch hẹn');

    try {
      await bookingService.verifyOtp(appointmentId, otpInput);
      showToast('Xác thực OTP thành công');
      localStorage.removeItem('tempAppointmentId');
      resetForm();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Xác thực OTP thất bại');
    }
  };

  const handleResendOtp = async () => {
    const appointmentId = createdAppointmentId || localStorage.getItem('tempAppointmentId');
    if (!appointmentId || resendCooldown > 0) return;
    setResendCooldown(30);
    setOtpTimer(300);
    try {
      await bookingService.resendOtp(appointmentId);
      showToast('OTP đã gửi lại');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gửi lại OTP thất bại');
    }
  };

  const resetForm = () => {
    setOtpStage(false);
    setOtpInput('');
    setCreatedAppointmentId(null);
    localStorage.removeItem('tempAppointmentId');
    setOtpTimer(0);
    setResendCooldown(0);
    setBookingData({ location:'', specialty:'', doctor:'', date:'', time:'', patient:{reason:''} });
    setSpecialties([]);
    setDoctors([]);
    setAvailableTimes([]);
    specialtiesCache.current = {};
    doctorsCache.current = {};
  };

  const formatTimer = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <div className="appointment-form-container">
      <h2 className="form-title">Thông tin lịch hẹn</h2>
      {!otpStage ? (
        <form className="appointment-form-grid" onSubmit={handleSubmit}>
          <div className="form-section card">
            <h3 className="section-title">Thông tin lịch khám</h3>
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
                {doctors.map(d => <option key={d._id} value={d._id}>{d.user?.fullName || 'Không xác định'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Ngày khám <span className="required">*</span></label>
              <input type="date" value={bookingData.date} min={today} onChange={e => setBookingData(prev => ({ ...prev, date: e.target.value }))} disabled={!bookingData.doctor} />
            </div>

            <div className="form-group">
              <label>Chọn giờ <span className="required">*</span></label>
              {loadingSlots && <p className="loading-text">⏳ Đang tải khung giờ...</p>}
              <select value={bookingData.time} onChange={e => setBookingData(prev => ({ ...prev, time: e.target.value }))} disabled={!bookingData.date || availableTimes.length === 0 || loadingSlots}>
                <option value="">{loadingSlots ? 'Đang tải...' : availableTimes.length === 0 ? 'Không có khung giờ trống' : 'Chọn giờ khám'}</option>
                {availableTimes.map((slot, i) => (
                  <option key={i} value={slot.time}>
                    {slot.displayTime}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section card">
            <h3 className="section-title">Triệu chứng / Lý do khám</h3>
            <div className="form-group">
              <textarea name="reason" placeholder="Vui lòng nhập triệu chứng..." value={bookingData.patient.reason} onChange={handlePatientChange} rows={4} />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loadingSubmit || loadingSlots || availableTimes.length === 0}>
            {loadingSubmit ? 'Đang gửi...' : 'Đặt lịch'}
          </button>
        </form>
      ) : (
        <div className="otp-verification card">
          <h3 className="section-title">Nhập mã OTP để xác nhận lịch hẹn</h3>
          <input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Mã OTP" maxLength={6} />
          <div className="otp-actions">
            <button type="button" onClick={handleVerifyOtp}>Xác nhận OTP</button>
            <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0} className={resendCooldown > 0 ? 'disabled' : ''}>
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