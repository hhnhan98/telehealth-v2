// src/pages/patient/components/AppointmentForm.jsx
import React, { useEffect, useState } from 'react';
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
  // ----- State -----
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
    patient: {
      fullName: '',
      gender: '',
      dob: '',
      phone: '',
      email: '',
      reason: ''
    }
  });

  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

  // ----- Prefill patient -----
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
          reason: ''
        }
      }));
    }
  }, [currentUser]);

  // ----- Toast helper -----
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  // ----- Load locations on mount -----
  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch(() => showToast('Lỗi load danh sách cơ sở', 'error'));
  }, []);

  // ----- Load specialties when location changes -----
  useEffect(() => {
    if (!bookingData.location) {
      setSpecialties([]);
      setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
      setDoctors([]);
      return;
    }
    fetchSpecialties(bookingData.location)
      .then(setSpecialties)
      .catch(() => showToast('Lỗi load chuyên khoa', 'error'));
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    setDoctors([]);
  }, [bookingData.location]);

  // ----- Load doctors when specialty changes -----
  useEffect(() => {
    if (!bookingData.location || !bookingData.specialty) {
      setDoctors([]);
      setBookingData(prev => ({ ...prev, doctor: '' }));
      return;
    }
    fetchDoctors(bookingData.location, bookingData.specialty)
      .then(setDoctors)
      .catch(() => showToast('Lỗi load bác sĩ', 'error'));
    setBookingData(prev => ({ ...prev, doctor: '' }));
  }, [bookingData.location, bookingData.specialty]);

  // ----- Load available times when doctor or date changes -----
  useEffect(() => {
    if (!bookingData.doctor || !bookingData.date) {
      setAvailableTimes([]);
      setBookingData(prev => ({ ...prev, time: '' }));
      return;
    }
    fetchAvailableSlots(bookingData.doctor, bookingData.date)
      .then(setAvailableTimes)
      .catch(() => setAvailableTimes([]));
    setBookingData(prev => ({ ...prev, time: '' }));
  }, [bookingData.doctor, bookingData.date]);

  // ----- Handlers -----
  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      patient: { ...prev.patient, [name]: value }
    }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) {
      showToast('Vui lòng chọn đầy đủ thông tin khám', 'error');
      return false;
    }
    if (!patient.fullName || !patient.gender || !patient.dob) {
      showToast('Vui lòng điền đầy đủ thông tin bệnh nhân', 'error');
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    // Tạo payload đúng backend: dùng patientId
    const appointmentPayload = {
      location: bookingData.location,
      specialty: bookingData.specialty,
      doctor: bookingData.doctor,
      date: bookingData.date,
      time: bookingData.time,
      patientId: currentUser._id  // <-- dùng ID của người dùng hiện tại
    };

    const res = await createAppointment(appointmentPayload);

    setCreatedAppointmentId(res.appointment._id);
    setOtpStage(true);
    showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
  } catch (err) {
    // Axios lỗi có thể nằm trong err.response.data
    const msg = err.response?.data?.error || 'Đặt lịch thất bại.';
    showToast(msg, 'error');
  } finally {
    setLoading(false);
  }
};


  const handleVerifyOtp = async () => {
    if (!otpInput) return showToast('Vui lòng nhập OTP', 'error');

    setLoading(true);
    try {
      await verifyOtp(createdAppointmentId, otpInput);
      showToast('Xác thực OTP thành công. Lịch hẹn đã được xác nhận', 'success');

      // Reset form
      setOtpStage(false);
      setOtpInput('');
      setCreatedAppointmentId(null);
      setBookingData(prev => ({
        location: '',
        specialty: '',
        doctor: '',
        date: '',
        time: '',
        patient: currentUser ? { ...prev.patient, reason: '' } : {
          fullName: '', gender: '', dob: '', phone: '', email: '', reason: ''
        }
      }));
      setSpecialties([]);
      setDoctors([]);
      setAvailableTimes([]);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Xác thực OTP thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----- Render -----
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
        <form className="appointment-form" onSubmit={handleSubmit}>
          <label>Cơ sở y tế</label>
          <select name="location" value={bookingData.location} onChange={handleChange}>
            <option value="">Chọn cơ sở y tế</option>
            {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
          </select>

          <label>Chuyên khoa</label>
          <select name="specialty" value={bookingData.specialty} onChange={handleChange} disabled={!bookingData.location}>
            <option value="">Chọn chuyên khoa</option>
            {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <label>Bác sĩ</label>
          <select name="doctor" value={bookingData.doctor} onChange={handleChange} disabled={!bookingData.specialty}>
            <option value="">Chọn bác sĩ</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
          </select>

          <label>Ngày khám</label>
          <input type="date" name="date" value={bookingData.date} onChange={handleChange} disabled={!bookingData.doctor} />

          <label>Chọn giờ</label>
          <select name="time" value={bookingData.time} onChange={handleChange} disabled={!bookingData.date}>
            <option value="">Chọn giờ khám</option>
            {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <h3>Thông tin bệnh nhân</h3>
          <input type="text" name="fullName" placeholder="Họ tên" value={bookingData.patient.fullName} onChange={handlePatientChange} required />
          <select name="gender" value={bookingData.patient.gender} onChange={handlePatientChange} required>
            <option value="">Giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          <input type="date" name="dob" value={bookingData.patient.dob} onChange={handlePatientChange} required />
          <input type="text" name="phone" placeholder="Số điện thoại" value={bookingData.patient.phone} onChange={handlePatientChange} />
          <input type="email" name="email" placeholder="Email" value={bookingData.patient.email} onChange={handlePatientChange} />
          <textarea name="reason" placeholder="Lý do khám" value={bookingData.patient.reason} onChange={handlePatientChange} />

          <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Đặt lịch'}</button>
        </form>
      ) : (
        <div className="otp-verification">
          <h3>Nhập mã OTP để xác nhận lịch hẹn</h3>
          <input type="text" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Mã OTP" />
          <button onClick={handleVerifyOtp} disabled={loading}>{loading ? 'Đang xác thực...' : 'Xác nhận OTP'}</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentForm;
