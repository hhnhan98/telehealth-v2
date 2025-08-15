import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './BookingForm.css';

const BookingForm = ({ currentUser }) => {
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
  const [toast, setToast] = useState({ message: '', type: '' });

  // Load locations & specialties
  useEffect(() => {
    axios.get('/locations')
      .then(res => setLocations(res.data))
      .catch(err => console.error(err));

    axios.get('/specialties')
      .then(res => setSpecialties(res.data))
      .catch(err => console.error(err));
  }, []);

  // Pre-fill patient info nếu user đã login
  useEffect(() => {
    if(currentUser) {
      setBookingData(prev => ({
        ...prev,
        patient: {
          fullName: currentUser.fullName || '',
          gender: currentUser.gender || '',
          dob: currentUser.dob ? currentUser.dob.slice(0,10) : '',
          phone: currentUser.phone || '',
          email: currentUser.email || '',
          reason: ''
        }
      }));
    }
  }, [currentUser]);

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

  // Validate frontend
  const validateForm = () => {
    const { specialty, doctor, location, date, time, patient } = bookingData;
    if (!specialty || !doctor || !location || !date || !time) {
      setToast({ message: 'Vui lòng chọn đầy đủ thông tin khám.', type: 'error' });
      return false;
    }
    if(!patient.fullName || !patient.gender || !patient.dob) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin bệnh nhân.', type: 'error' });
      return false;
    }
    // Email validate
    if(patient.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(patient.email)) {
      setToast({ message: 'Email không hợp lệ.', type: 'error' });
      return false;
    }
    // Phone validate
    if(patient.phone && !/^\d{9,10}$/.test(patient.phone)) {
      setToast({ message: 'Số điện thoại không hợp lệ.', type: 'error' });
      return false;
    }
    // DOB validate
    if(new Date(patient.dob) > new Date()) {
      setToast({ message: 'Ngày sinh không hợp lệ.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if(!validateForm()) return;

    setLoading(true);
    try {
      const { specialty, doctor, location, date, time, patient } = bookingData;
      await axios.post('/appointments', {
        specialty,
        doctor,
        location,
        date,
        time,
        patient
      });
      setToast({ message: 'Đặt lịch thành công!', type: 'success' });

      // Reset form nhưng giữ patient info nếu đã login
      setBookingData(prev => ({
        specialty: '',
        doctor: '',
        location: '',
        date: '',
        time: '',
        patient: currentUser ? { ...prev.patient, reason: '' } : {
          fullName: '',
          gender: '',
          dob: '',
          phone: '',
          email: '',
          reason: ''
        }
      }));
    } catch(err) {
      console.error(err);
      setToast({ message: 'Đặt lịch thất bại, vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentStep = !bookingData.specialty
    ? 1
    : !bookingData.doctor
      ? 2
      : !bookingData.location
        ? 3
        : !bookingData.date || !bookingData.time
          ? 4
          : 5;
*/
  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>

      {/* Toast message */}
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="progress-bar">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Chuyên khoa</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Bác sĩ</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Cơ sở</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>Ngày & Giờ</div>
        <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>Bệnh nhân</div>
      </div>

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
          required
        />
        <select
          name="gender"
          value={bookingData.patient.gender}
          onChange={handlePatientChange}
          disabled={!bookingData.time}
          required
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
          required
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

        <button
          type="submit"
          disabled={loading || !bookingData.patient.fullName || !bookingData.patient.gender || !bookingData.patient.dob}
        >
          {loading ? 'Đang gửi...' : 'Đặt lịch'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
