import React, { useEffect, useState, useRef } from 'react';
import {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  fetchAvailableSlots,
  createAppointment,
  verifyOtp,
  resendOtp
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
  const specialtiesCache = useRef({});
  const doctorsCache = useRef({});

  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    patient: { reason: '' }
  });

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  const today = new Date().toISOString().split('T')[0];

  // --- Load locations
  useEffect(() => {
    fetchLocations().then(res => setLocations(res.locations || []))
      .catch(() => showToast('Lỗi load cơ sở y tế', 'error'));
  }, []);

  // --- Load specialties
  useEffect(() => {
    setSpecialties([]); setDoctors([]); setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    if (!bookingData.location) return;
    if (specialtiesCache.current[bookingData.location]) {
      setSpecialties(specialtiesCache.current[bookingData.location]);
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchSpecialties(bookingData.location, { signal: controller.signal })
      .then(res => { setSpecialties(res.specialties || []); specialtiesCache.current[bookingData.location] = res.specialties || []; })
      .catch(err => { if (err.name !== 'AbortError') showToast('Lỗi load chuyên khoa', 'error'); });
    return () => controller.abort();
  }, [bookingData.location]);

  // --- Load doctors
  useEffect(() => {
    setDoctors([]); setBookingData(prev => ({ ...prev, doctor: '' }));
    if (!bookingData.location || !bookingData.specialty) return;
    const key = `${bookingData.location}_${bookingData.specialty}`;
    if (doctorsCache.current[key]) { setDoctors(doctorsCache.current[key]); return; }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchDoctors(bookingData.location, bookingData.specialty, { signal: controller.signal })
      .then(res => { setDoctors(res.doctors || []); doctorsCache.current[key] = res.doctors || []; })
      .catch(err => { if (err.name !== 'AbortError') showToast('Lỗi load bác sĩ', 'error'); });
    return () => controller.abort();
  }, [bookingData.location, bookingData.specialty]);

  // --- Load available slots
  useEffect(() => {
    setAvailableTimes([]); setBookingData(prev => ({ ...prev, time: '' }));
    if (!bookingData.doctor || !bookingData.date) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchAvailableSlots(bookingData.doctor, bookingData.date, { signal: controller.signal })
      .then(res => setAvailableTimes(res.availableSlots || []))
      .catch(err => { if (err.name !== 'AbortError') setAvailableTimes([]); });
    return () => controller.abort();
  }, [bookingData.doctor, bookingData.date]);

  // --- OTP timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // --- Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, patient: { ...prev.patient, [name]: value } }));
  };

  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) { showToast('Vui lòng chọn đầy đủ thông tin khám.', 'error'); return false; }
    if (!patient.reason) { showToast('Vui lòng nhập lý do khám.', 'error'); return false; }
    if (availableTimes.length === 0) { showToast('Không còn slot trống cho ngày này.', 'error'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault(); if (!validateForm()) return;
    setLoadingSubmit(true);
    try {
      const payload = {
        locationId: bookingData.location,
        specialtyId: bookingData.specialty,
        doctorId: bookingData.doctor,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.patient.reason
      };
      const res = await createAppointment(payload);
      setCreatedAppointmentId(res.appointment._id);
      setOtpStage(true); setOtpTimer(300); setResendCooldown(30);
      showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
