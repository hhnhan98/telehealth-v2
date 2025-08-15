import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './BookingForm.css';

const BookingForm = ({ currentUser }) => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [patientInfo, setPatientInfo] = useState({
    fullName: currentUser?.fullName || '',
    gender: currentUser?.gender || '',
    dob: currentUser?.dob || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/booking/locations');
        setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  // Load specialties khi chọn location
  useEffect(() => {
    if (selectedLocation) {
      const fetchSpecialties = async () => {
        try {
          const res = await axios.get(`/booking/specialties?locationId=${selectedLocation}`);
          setSpecialties(res.data);
        } catch (err) {
          console.error(err);
          setSpecialties([]);
        }
      };
      fetchSpecialties();
    } else {
      setSpecialties([]);
    }
    setSelectedSpecialty('');
    setDoctors([]);
    setSelectedDoctor('');
  }, [selectedLocation]);

  // Load doctors khi chọn specialty + location
  useEffect(() => {
    if (selectedLocation && selectedSpecialty) {
      const fetchDoctors = async () => {
        try {
          const res = await axios.get(`/booking/doctors?locationId=${selectedLocation}&specialtyId=${selectedSpecialty}`);
          setDoctors(res.data);
        } catch (err) {
          console.error(err);
          setDoctors([]);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
    }
    setSelectedDoctor('');
  }, [selectedLocation, selectedSpecialty]);

  // Load available times
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      const fetchTimes = async () => {
        try {
          const res = await axios.get(`/booking/available-slots?doctorId=${selectedDoctor}&date=${appointmentDate}`);
          setAvailableTimes(res.data);
        } catch (err) {
          console.error(err);
          setAvailableTimes([]);
        }
      };
      fetchTimes();
    } else {
      setAvailableTimes([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, appointmentDate]);

  const handlePatientChange = e => setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedLocation || !selectedSpecialty || !selectedDoctor || !appointmentDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/booking/create', {
        locationId: selectedLocation,
        specialtyId: selectedSpecialty,
        doctorId: selectedDoctor,
        date: appointmentDate,
        time: selectedTime,
        patient: patientInfo
      });
      setMessage({ type: 'success', text: 'Đặt lịch thành công!' });
      // Reset form
      setSelectedLocation('');
      setSelectedSpecialty('');
      setSelectedDoctor('');
      setAppointmentDate('');
      setSelectedTime('');
      setPatientInfo({
        fullName: currentUser?.fullName || '',
        gender: currentUser?.gender || '',
        dob: currentUser?.dob || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        reason: ''
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Đặt lịch thất bại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>
      {message.text && <div className={`toast ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit}>
        <label>Cơ sở y tế</label>
        <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} required>
          <option value="">Chọn cơ sở y tế</option>
          {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
        </select>

        <label>Chuyên khoa</label>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} required>
          <option value="">Chọn chuyên khoa</option>
          {specialties.map(spec => <option key={spec._id} value={spec._id}>{spec.name}</option>)}
        </select>

        <label>Bác sĩ</label>
        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
          <option value="">Chọn bác sĩ</option>
          {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.fullName}</option>)}
        </select>

        <label>Ngày khám</label>
        <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />

        <label>Chọn giờ</label>
        <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required>
          <option value="">Chọn giờ khám</option>
          {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
        </select>

        <h3>Thông tin bệnh nhân</h3>
        <input type="text" name="fullName" placeholder="Họ tên" value={patientInfo.fullName} onChange={handlePatientChange} required />
        <select name="gender" value={patientInfo.gender} onChange={handlePatientChange} required>
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
        <input type="date" name="dob" value={patientInfo.dob} onChange={handlePatientChange} required />
        <input type="text" name="phone" placeholder="Số điện thoại" value={patientInfo.phone} onChange={handlePatientChange} required />
        <input type="email" name="email" placeholder="Email" value={patientInfo.email} onChange={handlePatientChange} required />
        <textarea name="reason" placeholder="Lý do khám" v
