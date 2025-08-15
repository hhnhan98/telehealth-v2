import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './BookingForm.css';

const BookingForm = () => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const [bookingData, setBookingData] = useState({
    specialty: '',
    doctor: '',
    location: '',
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load locations & specialties
  useEffect(() => {
    axios.get('/locations')
      .then(res => setLocations(res.data))
      .catch(err => console.error(err));

    axios.get('/specialties')
      .then(res => setSpecialties(res.data))
      .catch(err => console.error(err));
  }, []);

  // Load doctors khi chọn chuyên khoa
  useEffect(() => {
    if (bookingData.specialty) {
      axios.get(`/doctors?specialty=${bookingData.specialty}`)
        .then(res => setDoctors(res.data))
        .catch(err => console.error(err));
    } else {
      setDoctors([]);
      setBookingData(prev => ({ ...prev, doctor: '' }));
    }
  }, [bookingData.specialty]);

  // Load available times khi chọn bác sĩ + ngày
  useEffect(() => {
    if (bookingData.doctor && bookingData.date) {
      axios.get(`/appointments/available?doctor=${bookingData.doctor}&date=${bookingData.date}`)
        .then(res => setAvailableTimes(res.data))
        .catch(err => console.error(err));
    } else {
      setAvailableTimes([]);
      setBookingData(prev => ({ ...prev, time: '' }));
    }
  }, [bookingData.doctor, bookingData.date]);

  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      patient: { ...prev.patient, [name]: value }
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { specialty, doctor, location, date, time, patient } = bookingData;

    if (!specialty || !doctor || !location || !date || !time || !patient.fullName || !patient.gender || !patient.dob) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/appointments', {
        specialty,
        doctor,
        location,
        date,
        time,
        patient
      });
      setSuccess('Đặt lịch thành công!');
      setError(null);
      setBookingData({
        specialty: '',
        doctor: '',
        location: '',
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
    } catch (err) {
      console.error(err);
      setError('Đặt lịch thất bại, vui lòng thử lại');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Xác định step hiện tại để highlight progress
  const currentStep = !bookingData.specialty
    ? 1
    : !bookingData.doctor
      ? 2
      : !bookingData.location
        ? 3
        : !bookingData.date || !bookingData.time
          ? 4
          : 5;

  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Chuyên khoa</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Bác sĩ</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Cơ sở</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>Ngày & Giờ</div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>Bệnh nhân</div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>Chuyên khoa</label>
        <select
          value={bookingData.specialty}
          onChange={e => setBookingData({ ...bookingData, specialty: e.target.value })}
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

        <label>Cơ sở y tế</label>
        <select
          value={bookingData.location}
          onChange={e => setBookingData({ ...bookingData, location: e.target.value })}
          disabled={!bookingData.doctor}
        >
          <option value="">Chọn cơ sở y tế</option>
          {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
        </select>

        <label>Ngày khám</label>
        <input
          type="date"
          value={bookingData.date}
          onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
          disabled={!bookingData.location}
        />

        <label>Chọn giờ</label>
        <select
          value={bookingData.time}
          onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
          disabled={!bookingData.date}
        >
          <option value="">Chọn giờ khám</option>
          {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
        </select>

        <h3>Thông tin bệnh nhân</h3>
        <input
          type="text"
          name="fullName"
          placeholder="Họ tên"
          value={bookingData.patient.fullName}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        />
        <select
          name="gender"
          value={bookingData.patient.gender}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        >
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
        <input
          type="date"
          name="dob"
          value={bookingData.patient.dob}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        />
        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={bookingData.patient.phone}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={bookingData.patient.email}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        />
        <textarea
          name="reason"
          placeholder="Lý do khám"
          value={bookingData.patient.reason}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
        />

        <button type="submit" disabled={loading || !bookingData.patient.fullName || !bookingData.patient.gender || !bookingData.patient.dob}>
          {loading ? 'Đang gửi...' : 'Đặt lịch'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
