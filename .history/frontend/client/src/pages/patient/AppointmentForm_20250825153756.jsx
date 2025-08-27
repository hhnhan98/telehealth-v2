import React, { useState, useEffect, useCallback, useRef } from 'react';
import bookingService from '../../services/bookingService';
import dayjs from 'dayjs';
import './styles/AppointmentForm.css';

const AppointmentForm = ({ currentUser }) => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    patient: { reason: '' },
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const specialtiesCache = useRef({});
  const doctorsCache = useRef({});
  const today = new Date().toISOString().split('T')[0];

  const showToast = useCallback((msg) => alert(msg), []);

  // -------- Load Locations --------
  useEffect(() => {
    const loadLocations = async () => {
      const list = await bookingService.fetchLocations();
      setLocations(list);
    };
    loadLocations();
  }, []);

  // -------- Load Specialties --------
  const loadSpecialties = useCallback(async () => {
    if (!bookingData.location) return setSpecialties([]);
    if (specialtiesCache.current[bookingData.location]) {
      setSpecialties(specialtiesCache.current[bookingData.location]);
      return;
    }
    const list = await bookingService.fetchSpecialties(bookingData.location);
    setSpecialties(list);
    specialtiesCache.current[bookingData.location] = list;
  }, [bookingData.location]);

  useEffect(() => {
    setSpecialties([]);
    setDoctors([]);
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    loadSpecialties();
  }, [bookingData.location, loadSpecialties]);

  // -------- Load Doctors --------
  const loadDoctors = useCallback(async () => {
    if (!bookingData.location || !bookingData.specialty) {
      setDoctors([]);
      return;
    }
    const key = `${bookingData.location}_${bookingData.specialty}`;
    if (doctorsCache.current[key]) {
      setDoctors(doctorsCache.current[key]);
      return;
    }
    const list = await bookingService.fetchDoctors(bookingData.location, bookingData.specialty);
    setDoctors(list);
    doctorsCache.current[key] = list;
  }, [bookingData.location, bookingData.specialty]);

  useEffect(() => {
    setDoctors([]);
    setBookingData(prev => ({ ...prev, doctor: '' }));
    loadDoctors();
  }, [bookingData.location, bookingData.specialty, loadDoctors]);

  // -------- Load Available Slots --------
  const loadAvailableSlots = useCallback(async () => {
    if (!bookingData.doctor || !bookingData.date) {
      setAvailableTimes([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const rawSlots = await bookingService.fetchAvailableSlots(bookingData.doctor, bookingData.date);

      const normalizedSlots = rawSlots.map(slot => {
        const timeStr = typeof slot === 'string' ? slot : slot?.time || '';
        const datetimeVN = slot?.datetimeVN || dayjs(`${bookingData.date}T${timeStr}`).format('HH:mm');
        return { time: timeStr, displayTime: datetimeVN, datetimeVN };
      });

      setAvailableTimes(normalizedSlots);
    } catch (err) {
      console.error(err);
      setAvailableTimes([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData.doctor, bookingData.date]);

  useEffect(() => {
    setAvailableTimes([]);
    setBookingData(prev => ({ ...prev, time: '' }));
    loadAvailableSlots();
  }, [bookingData.doctor, bookingData.date, loadAvailableSlots]);

  // -------- OTP Timer --------
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

  // -------- Handlers --------
  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, patient: { ...prev.patient, [name]: value } }));
  };

  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) {
      showToast('Vui lòng chọn đầy đủ thông tin khám.');
      return false;
    }
    if (!patient.reason) {
      showToast('Vui lòng nhập lý do khám.');
      return false;
    }
    if (!availableTimes.length) {
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
        time: bookingData.time,
        reason: bookingData.patient.reason,
      };
      const res = await bookingService.createAppointment(payload);

      const appointmentId = res?.data?.appointment?._id;
      if (!appointmentId) throw new Error('Không thể lấy ID appointment');

      setCreatedAppointmentId(appointmentId);
      localStorage.setItem('tempAppointmentId', appointmentId);

      setOtpStage(true);
      setOtpTimer(300);
      setResendCooldown(30);
      showToast('Đặt lịch thành công! OTP đã gửi email.');
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
    if (!appointmentId) return showToast('Không tìm thấy thông tin appointment. Vui lòng đặt lại.');

    try {
      await bookingService.verifyOtp(appointmentId, otpInput);
      showToast('Xác thực OTP thành công.');
      localStorage.removeItem('tempAppointmentId');
      resetForm();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Xác thực OTP thất bại.');
    }
  };

  const handleResendOtp = async () => {
    const appointmentId = createdAppointmentId || localStorage.getItem('tempAppointmentId');
    if (!appointmentId || resendCooldown > 0) return;

    setResendCooldown(30);
    setOtpTimer(300);
    try {
      await bookingService.resendOtp(appointmentId);
      showToast('OTP đã được gửi lại.');
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

  // -------- Render --------
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
            </div
