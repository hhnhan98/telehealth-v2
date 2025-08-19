// src/pages/patient/components/AppointmentForm.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ---------------- Custom Hook ----------------
const useDropdown = (fetchFn, deps = [], resetDeps = []) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef({});
  const abortRef = useRef(null);

  const load = async (...args) => {
    const key = args.join('_');
    if (cacheRef.current[key]) {
      setOptions(cacheRef.current[key]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetchFn(...args, { signal: controller.signal });
      const data = res?.specialties || res?.doctors || res?.availableSlots || [];
      setOptions(data);
      cacheRef.current[key] = data;
    } catch (err) {
      if (err.name !== 'AbortError') setOptions([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(...deps); }, deps); // auto-load

  // Reset options if any resetDeps change
  useEffect(() => { setOptions([]); }, resetDeps);

  return [options, load, loading];
};

// ---------------- Component ----------------
const AppointmentForm = () => {
  const today = new Date().toISOString().split('T')[0];

  // ---------------- State ----------------
  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    patient: { reason: '' }
  });

  const [locations] = useDropdown(fetchLocations, []);
  const [specialties] = useDropdown(fetchSpecialties, [bookingData.location], [bookingData.location]);
  const [doctors] = useDropdown(fetchDoctors, [bookingData.location, bookingData.specialty], [bookingData.location, bookingData.specialty]);
  const [availableTimes] = useDropdown(fetchAvailableSlots, [bookingData.doctor, bookingData.date], [bookingData.doctor, bookingData.date]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [otp, setOtp] = useState({
    stage: false,
    input: '',
    appointmentId: null,
    timer: 0,
    resendCooldown: 0
  });

  // ---------------- Toast ----------------
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  }, []);

  // ---------------- OTP Timer ----------------
  useEffect(() => {
    if (otp.timer <= 0) return;
    const interval = setInterval(() => setOtp(prev => ({ ...prev, timer: Math.max(prev.timer - 1, 0) })), 1000);
    return () => clearInterval(interval);
  }, [otp.timer]);

  useEffect(() => {
    if (otp.resendCooldown <= 0) return;
    const interval = setInterval(() => setOtp(prev => ({ ...prev, resendCooldown: Math.max(prev.resendCooldown - 1, 0) })), 1000);
    return () => clearInterval(interval);
  }, [otp.resendCooldown]);

  // ---------------- Handlers ----------------
  const handleChange = e => {
    const { name, value } = e.target;
    if (name in bookingData.patient) {
      setBookingData(prev => ({ ...prev, patient: { ...prev.patient, [name]: value } }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) { showToast('Vui lòng chọn đầy đủ thông tin khám.', 'error'); return false; }
    if (!patient.reason) { showToast('Vui lòng nhập lý do khám.', 'error'); return false; }
    if (availableTimes.length === 0) { showToast('Không còn slot trống cho ngày này.', 'error'); return false; }
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
        reason: bookingData.patient.reason
      };
      const res = await createAppointment(payload);
      setOtp({ stage: true, input: '', appointmentId: res.appointment._id, timer: 300, resendCooldown: 30 });
      showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message || err);
      showToast(err.response?.data?.error || 'Đặt lịch thất bại.', 'error');
    } finally { setLoadingSubmit(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp.input) return showToast('Vui lòng nhập OTP', 'error');
    try {
      await verifyOtp(otp.appointmentId, otp.input);
      showToast('Xác thực OTP thành công.', 'success');
      setOtp({ stage: false, input: '', appointmentId: null, timer: 0, resendCooldown: 0 });
      setBookingData({ location:'', specialty:'', doctor:'', date:'', time:'', patient:{reason:''} });
    } catch (err) {
      console.error('OTP verification error:', err.response || err);
      showToast(err.response?.data?.error || 'Xác thực OTP thất bại.', 'error');
    }
  };

  const handleResendOtp = async () => {
    if (!otp.appointmentId || otp.resendCooldown > 0) return;
    setOtp(prev => ({ ...prev, resendCooldown: 30, timer: 300 }));
    try { await resendOtp(otp.appointmentId); showToast('OTP đã được gửi lại.', 'success'); } 
    catch (err) { console.error('Resend OTP error:', err.response || err); showToast(err.response?.data?.error || 'Gửi lại OTP thất bại', 'error'); }
  };

  const formatTimer = sec => `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;

  // ---------------- Render ----------------
  return (
    <div className="appointment-form-container">
      <h2 className="form-title">Đặt lịch khám bệnh</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {!otp.stage ? (
        <form className="appointment-form-grid" onSubmit={handleSubmit}>
          <div className="form-section card">
            <h3 className="section-title">Thông tin lịch khám</h3>
            <div className="form-group">
              <label>Cơ sở y tế <span className="required">*</span></label>
              <select name="location" value={bookingData.location} onChange={handleChange}>
                <option value="">Chọn cơ sở y tế</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Chuyên khoa <span className="required">*</span></label>
              <select name="specialty" value={bookingData.specialty} onChange={handleChange} disabled={!bookingData.location}>
                <option value="">Chọn chuyên khoa</option>
                {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Bác sĩ <span className="required">*</span></label>
              <select name="doctor" value={bookingData.doctor} onChange={handleChange} disabled={!bookingData.specialty}>
                <option value="">Chọn bác sĩ</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Ngày khám <span className="required">*</span></label>
              <input type="date" name="date" value={bookingData.date} min={today} onChange={handleChange} disabled={!bookingData.doctor} />
            </div>

            <div className="form-group">
              <label>Chọn giờ <span className="required">*</span></label>
              <select name="time" value={bookingData.time} onChange={handleChange} disabled={!bookingData.date || availableTimes.length === 0}>
                <option value="">Chọn giờ khám</option>
                {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section card">
            <h3 className="section-title">Triệu chứng / Lý do khám</h3>
            <div className="form-group">
              <textarea name="reason" placeholder="Vui lòng nhập triệu chứng..." value={bookingData.patient.reason} onChange={handleChange}/>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loadingSubmit || availableTimes.length === 0}>
            {loadingSubmit ? 'Đang gửi...' : 'Đặt lịch'}
          </button>
        </form>
      ) : (
        <div className="otp-verification card">
          <h3 className="section-title">Nhập mã OTP để xác nhận lịch hẹn</h3>
          <input type="text" value={otp.input} onChange={e => setOtp(prev => ({ ...prev, input: e.target.value }))} placeholder="Mã OTP" />
          <div className="otp-actions">
            <button onClick={handleVerifyOtp}>Xác nhận OTP</button>
            <button onClick={handleResendOtp} disabled={otp.resendCooldown > 0} className={otp.resendCooldown > 0 ? 'disabled' : ''}>
              {otp.resendCooldown > 0 ? `Gửi lại sau ${otp.resendCooldown}s` : 'Gửi lại OTP'}
            </button>
          </div>
          {otp.timer > 0 && <p className="otp-timer">OTP còn hiệu lực: {formatTimer(otp.timer)}</p>}
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;

// import React, { useEffect, useState, useRef } from 'react';
// import {
//   fetchLocations,
//   fetchSpecialties,
//   fetchDoctors,
//   fetchAvailableSlots,
//   createAppointment,
//   verifyOtp,
//   resendOtp
// } from '../../../services/bookingService';
// import './AppointmentForm.css';

// const AppointmentForm = ({ currentUser }) => {
//   const [locations, setLocations] = useState([]);
//   const [specialties, setSpecialties] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [availableTimes, setAvailableTimes] = useState([]);

//   const [loadingSubmit, setLoadingSubmit] = useState(false);
//   const [loadingOtp, setLoadingOtp] = useState(false);
//   const [toast, setToast] = useState({ message: '', type: '' });

//   const [otpStage, setOtpStage] = useState(false);
//   const [otpInput, setOtpInput] = useState('');
//   const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
//   const [otpTimer, setOtpTimer] = useState(0);
//   const [resendCooldown, setResendCooldown] = useState(0);

//   const abortControllerRef = useRef(null);
//   const specialtiesCache = useRef({});
//   const doctorsCache = useRef({});

//   const [bookingData, setBookingData] = useState({
//     location: '',
//     specialty: '',
//     doctor: '',
//     date: '',
//     time: '',
//     patient: { reason: '' }
//   });

//   const showToast = (message, type = 'success', duration = 3000) => {
//     setToast({ message, type });
//     setTimeout(() => setToast({ message: '', type: '' }), duration);
//   };

//   const today = new Date().toISOString().split('T')[0];

//   // --- Load locations
//   useEffect(() => {
//     fetchLocations().then(res => setLocations(res.locations || []))
//       .catch(() => showToast('Lỗi load cơ sở y tế', 'error'));
//   }, []);

//   // --- Load specialties
//   useEffect(() => {
//     setSpecialties([]); setDoctors([]); setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
//     if (!bookingData.location) return;
//     if (specialtiesCache.current[bookingData.location]) {
//       setSpecialties(specialtiesCache.current[bookingData.location]);
//       return;
//     }
//     abortControllerRef.current?.abort();
//     const controller = new AbortController();
//     abortControllerRef.current = controller;
//     fetchSpecialties(bookingData.location, { signal: controller.signal })
//       .then(res => { setSpecialties(res.specialties || []); specialtiesCache.current[bookingData.location] = res.specialties || []; })
//       .catch(err => { if (err.name !== 'AbortError') showToast('Lỗi load chuyên khoa', 'error'); });
//     return () => controller.abort();
//   }, [bookingData.location]);

//   // --- Load doctors
//   useEffect(() => {
//     setDoctors([]); setBookingData(prev => ({ ...prev, doctor: '' }));
//     if (!bookingData.location || !bookingData.specialty) return;
//     const key = `${bookingData.location}_${bookingData.specialty}`;
//     if (doctorsCache.current[key]) { setDoctors(doctorsCache.current[key]); return; }
//     abortControllerRef.current?.abort();
//     const controller = new AbortController();
//     abortControllerRef.current = controller;
//     fetchDoctors(bookingData.location, bookingData.specialty, { signal: controller.signal })
//       .then(res => { setDoctors(res.doctors || []); doctorsCache.current[key] = res.doctors || []; })
//       .catch(err => { if (err.name !== 'AbortError') showToast('Lỗi load bác sĩ', 'error'); });
//     return () => controller.abort();
//   }, [bookingData.location, bookingData.specialty]);

//   // --- Load available slots
//   useEffect(() => {
//     setAvailableTimes([]); setBookingData(prev => ({ ...prev, time: '' }));
//     if (!bookingData.doctor || !bookingData.date) return;
//     abortControllerRef.current?.abort();
//     const controller = new AbortController();
//     abortControllerRef.current = controller;
//     fetchAvailableSlots(bookingData.doctor, bookingData.date, { signal: controller.signal })
//       .then(res => setAvailableTimes(res.availableSlots || []))
//       .catch(err => { if (err.name !== 'AbortError') setAvailableTimes([]); });
//     return () => controller.abort();
//   }, [bookingData.doctor, bookingData.date]);

//   // --- OTP timer
//   useEffect(() => {
//     if (otpTimer <= 0) return;
//     const interval = setInterval(() => setOtpTimer(prev => Math.max(prev - 1, 0)), 1000);
//     return () => clearInterval(interval);
//   }, [otpTimer]);

//   // --- Resend cooldown
//   useEffect(() => {
//     if (resendCooldown <= 0) return;
//     const interval = setInterval(() => setResendCooldown(prev => Math.max(prev - 1, 0)), 1000);
//     return () => clearInterval(interval);
//   }, [resendCooldown]);

//   const handlePatientChange = e => {
//     const { name, value } = e.target;
//     setBookingData(prev => ({ ...prev, patient: { ...prev.patient, [name]: value } }));
//   };

//   const validateForm = () => {
//     const { location, specialty, doctor, date, time, patient } = bookingData;
//     if (!location || !specialty || !doctor || !date || !time) { showToast('Vui lòng chọn đầy đủ thông tin khám.', 'error'); return false; }
//     if (!patient.reason) { showToast('Vui lòng nhập lý do khám.', 'error'); return false; }
//     if (availableTimes.length === 0) { showToast('Không còn slot trống cho ngày này.', 'error'); return false; }
//     return true;
//   };

//   const handleSubmit = async e => {
//     e.preventDefault(); if (!validateForm()) return;
//     setLoadingSubmit(true);
//     try {
//       const payload = {
//         locationId: bookingData.location,
//         specialtyId: bookingData.specialty,
//         doctorId: bookingData.doctor,
//         date: bookingData.date,
//         time: bookingData.time,
//         reason: bookingData.patient.reason
//       };
//       const res = await createAppointment(payload);
//       setCreatedAppointmentId(res.appointment._id);
//       setOtpStage(true); setOtpTimer(300); setResendCooldown(30);
//       showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
//     } catch (err) {
//       console.error('Booking error detail:', err.response?.data || err.message || err);
//       showToast(err.response?.data?.error || 'Đặt lịch thất bại.', 'error');
//     } finally { setLoadingSubmit(false); }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otpInput) return showToast('Vui lòng nhập OTP', 'error');
//     setLoadingOtp(true);
//     try {
//       await verifyOtp(createdAppointmentId, otpInput);
//       showToast('Xác thực OTP thành công.', 'success');
//       setOtpStage(false); setOtpInput(''); setCreatedAppointmentId(null);
//       setOtpTimer(0); setResendCooldown(0);
//       setBookingData({ location:'', specialty:'', doctor:'', date:'', time:'', patient:{reason:''} });
//       setSpecialties([]); setDoctors([]); setAvailableTimes([]);
//       specialtiesCache.current = {}; doctorsCache.current = {};
//     } catch (err) {
//       console.error('OTP verification error:', err.response || err);
//       showToast(err.response?.data?.error || 'Xác thực OTP thất bại.', 'error');
//     } finally { setLoadingOtp(false); }
//   };

//   const handleResendOtp = async () => {
//     if (!createdAppointmentId || resendCooldown > 0) return;
//     setResendCooldown(30); setOtpTimer(300);
//     try { await resendOtp(createdAppointmentId); showToast('OTP đã được gửi lại.', 'success'); }
//     catch (err) { console.error('Resend OTP error:', err.response || err); showToast(err.response?.data?.error || 'Gửi lại OTP thất bại', 'error'); }
//   };

//   const formatTimer = sec => { const m = Math.floor(sec/60); const s = sec%60; return `${m}:${s.toString().padStart(2,'0')}`; };

//   return (
//     <div className="appointment-form-container">
//       <h2 className="form-title">Đặt lịch khám bệnh</h2>
//       {toast.message && <div className={`toast ${toast.type}`}>{toast.message}<span className="close" onClick={()=>setToast({message:'',type:''})}>&times;</span></div>}

//       {!otpStage ? (
//         <form className="appointment-form-grid" onSubmit={handleSubmit}>
//           <div className="form-section card">
//             <h3 className="section-title">Thông tin lịch khám</h3>
//             <div className="form-group">
//               <label>Cơ sở y tế <span className="required">*</span></label>
//               <select value={bookingData.location} onChange={e=>setBookingData(prev=>({...prev,location:e.target.value}))}>
//                 <option value="">Chọn cơ sở y tế</option>
//                 {locations.map(loc=> <option key={loc._id} value={loc._id}>{loc.name}</option>)}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Chuyên khoa <span className="required">*</span></label>
//               <select value={bookingData.specialty} onChange={e=>setBookingData(prev=>({...prev,specialty:e.target.value}))} disabled={!bookingData.location}>
//                 <option value="">Chọn chuyên khoa</option>
//                 {specialties.map(s=> <option key={s._id} value={s._id}>{s.name}</option>)}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Bác sĩ <span className="required">*</span></label>
//               <select value={bookingData.doctor} onChange={e=>setBookingData(prev=>({...prev,doctor:e.target.value}))} disabled={!bookingData.specialty}>
//                 <option value="">Chọn bác sĩ</option>
//                 {doctors.map(d=> <option key={d._id} value={d._id}>{d.fullName}</option>)}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Ngày khám <span className="required">*</span></label>
//               <input type="date" value={bookingData.date} min={today} onChange={e=>setBookingData(prev=>({...prev,date:e.target.value}))} disabled={!bookingData.doctor}/>
//             </div>

//             <div className="form-group">
//               <label>Chọn giờ <span className="required">*</span></label>
//               <select value={bookingData.time} onChange={e=>setBookingData(prev=>({...prev,time:e.target.value}))} disabled={!bookingData.date || availableTimes.length===0}>
//                 <option value="">Chọn giờ khám</option>
//                 {availableTimes.map(t=> <option key={t} value={t}>{t}</option>)}
//               </select>
//             </div>
//           </div>

//           <div className="form-section card">
//             <h3 className="section-title">Triệu chứng / Lý do khám</h3>
//             <div className="form-group">
//               <textarea name="reason" placeholder="Vui lòng nhập triệu chứng..." value={bookingData.patient.reason} onChange={handlePatientChange}/>
//             </div>
//           </div>

//           <button type="submit" className="btn-submit" disabled={loadingSubmit || availableTimes.length===0}>
//             {loadingSubmit?'Đang gửi...':'Đặt lịch'}
//           </button>
//         </form>
//       ) : (
//         <div className="otp-verification card">
//           <h3 className="section-title">Nhập mã OTP để xác nhận lịch hẹn</h3>
//           <input type="text" value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="Mã OTP" />
//           <div className="otp-actions">
//             <button onClick={handleVerifyOtp} disabled={loadingOtp}>{loadingOtp?'Đang xác thực...':'Xác nhận OTP'}</button>
//             <button onClick={handleResendOtp} disabled={resendCooldown>0 || loadingOtp} className={resendCooldown>0?'disabled':''}>
//               {resendCooldown>0?`Gửi lại sau ${resendCooldown}s`:'Gửi lại OTP'}
//             </button>
//           </div>
//           {otpTimer>0 && <p className="otp-timer">OTP còn hiệu lực: {formatTimer(otpTimer)}</p>}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AppointmentForm;
