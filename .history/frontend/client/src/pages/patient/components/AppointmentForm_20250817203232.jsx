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
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const [otpStage, setOtpStage] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

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
  // Prefill patient info nếu có currentUser
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
  // Load dropdown dữ liệu
  useEffect(() => {
    fetchLocations()
      .then(res => setLocations(res.locations || []))
      .catch(() => showToast('Lỗi load cơ sở y tế', 'error'));
  }, []);

  useEffect(() => {
    if (!bookingData.location) {
      setSpecialties([]);
      setDoctors([]);
      setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
      return;
    }
    fetchSpecialties(bookingData.location)
      .then(res => setSpecialties(res.specialties || []))
      .catch(() => showToast('Lỗi load chuyên khoa', 'error'));
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    setDoctors([]);
  }, [bookingData.location]);

  useEffect(() => {
    if (!bookingData.location || !bookingData.specialty) {
      setDoctors([]);
      setBookingData(prev => ({ ...prev, doctor: '' }));
      return;
    }
    fetchDoctors(bookingData.location, bookingData.specialty)
      .then(res => setDoctors(res.doctors || []))
      .catch(() => showToast('Lỗi load bác sĩ', 'error'));
    setBookingData(prev => ({ ...prev, doctor: '' }));
  }, [bookingData.location, bookingData.specialty]);

  useEffect(() => {
    if (!bookingData.doctor || !bookingData.date) {
      setAvailableTimes([]);
      setBookingData(prev => ({ ...prev, time: '' }));
      return;
    }
    fetchAvailableSlots(bookingData.doctor, bookingData.date)
      .then(res => setAvailableTimes(res.availableSlots || []))
      .catch(() => setAvailableTimes([]));
    setBookingData(prev => ({ ...prev, time: '' }));
  }, [bookingData.doctor, bookingData.date]);

  // -------------------------
  // Toast helper
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  // -------------------------
  // Form handlers
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

    setLoading(true);
    try {
      const payload = {
        locationId: bookingData.location,
        specialtyId: bookingData.specialty,
        doctorId: bookingData.doctor,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.pa
        ...(currentUser?._id ? { patientId: currentUser._id } : { patient: bookingData.patient })
      };

      const res = await createAppointment(payload);
      setCreatedAppointmentId(res.appointment._id);
      setOtpStage(true);
      showToast('Đặt lịch thành công! OTP đã gửi email.', 'success');
    } catch (err) {
      console.error('Booking error:', err.response || err);
      showToast(err.response?.data?.error || 'Đặt lịch thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) return showToast('Vui lòng nhập OTP', 'error');
    setLoading(true);
    try {
      await verifyOtp(createdAppointmentId, otpInput);
      showToast('Xác thực OTP thành công. Lịch hẹn đã được xác nhận.', 'success');
      setOtpStage(false);
      setOtpInput('');
      setCreatedAppointmentId(null);
      setBookingData({
        location: '',
        specialty: '',
        doctor: '',
        date: '',
        time: '',
        patient: currentUser
          ? { ...bookingData.patient, reason: '' }
          : { fullName: '', gender: '', dob: '', phone: '', email: '', reason: '' }
      });
      setSpecialties([]);
      setDoctors([]);
      setAvailableTimes([]);
    } catch (err) {
      console.error('OTP verification error:', err.response || err);
      showToast(err.response?.data?.error || 'Xác thực OTP thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <select
            value={bookingData.location}
            onChange={e => setBookingData({ ...bookingData, location: e.target.value })}
          >
            <option value="">Chọn cơ sở y tế</option>
            {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
          </select>

          <label>Chuyên khoa</label>
          <select
            value={bookingData.specialty}
            onChange={e => setBookingData({ ...bookingData, specialty: e.target.value })}
            disabled={!bookingData.location}
          >
            <option value="">Chọn chuyên khoa</option>
            {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <label>Bác sĩ</label>
          <select
            value={bookingData.doctor}
            onChange={e => setBookingData({ ...bookingData, doctor: e.target.value })}
            disabled={!bookingData.specialty}
          >
            <option value="">Chọn bác sĩ</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
          </select>

          <label>Ngày khám</label>
          <input
            type="date"
            value={bookingData.date}
            onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
            disabled={!bookingData.doctor}
          />

          <label>Chọn giờ</label>
          <select
            value={bookingData.time}
            onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
            disabled={!bookingData.date}
          >
            <option value="">Chọn giờ khám</option>
            {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Luôn hiển thị thông tin bệnh nhân, prefill nếu đăng nhập */}
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
