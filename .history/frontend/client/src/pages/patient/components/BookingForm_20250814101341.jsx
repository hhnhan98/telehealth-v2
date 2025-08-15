import React, { useState, useEffect } from 'react';
import { createAppointment } from '../../../services/bookingService';
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

  // Load cơ sở y tế và chuyên khoa
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, specRes] = await Promise.all([
          axios.get('/appointments/locations'),
          axios.get('/appointments/specialties')
        ]);
        setLocations(locRes.data);
        setSpecialties(specRes.data);
      } catch (err) {
        console.error('Lỗi tải dropdown:', err);
      }
    };
    fetchData();
  }, []);

  // Load bác sĩ theo chuyên khoa
  useEffect(() => {
    if (selectedSpecialty) {
      const fetchDoctors = async () => {
        try {
          const res = await axios.get(`/appointments/doctors?specialty=${selectedSpecialty}`);
          setDoctors(res.data);
        } catch (err) {
          console.error('Lỗi tải bác sĩ:', err);
          setDoctors([]);
        }
      };
      fetchDoctors();
    } else {
      setDoctors([]);
    }
    setSelectedDoctor('');
  }, [selectedSpecialty]);

  // Load giờ khám trống
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      const fetchTimes = async () => {
        try {
          const res = await axios.get(
            `/appointments/available?doctor=${selectedDoctor}&date=${appointmentDate}`
          );
          setAvailableTimes(res.data);
        } catch (err) {
          console.error('Lỗi tải giờ khám:', err);
          setAvailableTimes([]);
        }
      };
      fetchTimes();
    } else {
      setAvailableTimes([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, appointmentDate]);

  const handlePatientChange = e => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (
      !selectedLocation ||
      !selectedSpecialty ||
      !selectedDoctor ||
      !appointmentDate ||
      !selectedTime
    ) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        location: selectedLocation,
        specialty: selectedSpecialty,
        doctor: selectedDoctor,
        date: appointmentDate,
        time: selectedTime,
        patient: patientInfo
      };

      await createAppointment(payload);

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
      console.error('Lỗi đặt lịch:', err);
      const msg = err.response?.data?.error || 'Đặt lịch thất bại, vui lòng thử lại.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>

      {message.text && (
        <div className={`toast ${message.type}`}>
          {message.text}
          <span className="close" onClick={() => setMessage({ type: '', text: '' })}>
            &times;
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Cơ sở y tế</label>
        <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} required>
          <option value="">Chọn cơ sở y tế</option>
          {locations.map(loc => (
            <option key={loc._id} value={loc._id}>{loc.name}</option>
          ))}
        </select>

        <label>Chuyên khoa</label>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} required>
          <option value="">Chọn chuyên khoa</option>
          {specialties.map(spec => (
            <option key={spec._id} value={spec._id}>{spec.name}</option>
          ))}
        </select>

        <label>Bác sĩ</label>
        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
          <option value="">Chọn bác sĩ</option>
          {doctors.map(doc => (
            <option key={doc._id} value={doc._id}>{doc.fullName}</option>
          ))}
        </select>

        <label>Ngày khám</label>
        <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />

        <label>Chọn giờ</label>
        <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required>
          <option value="">Chọn giờ khám</option>
          {availableTimes.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
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
        <textarea name="reason" placeholder="Lý do khám" value={patientInfo.reason} onChange={handlePatientChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Đặt lịch'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
