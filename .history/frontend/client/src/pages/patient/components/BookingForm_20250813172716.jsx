import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './BookingForm.css';

const BookingForm = () => {
  // State dropdown
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
    fullName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    reason: ''
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
    if(selectedSpecialty) {
      axios.get(`/doctors?specialty=${selectedSpecialty}`)
        .then(res => setDoctors(res.data))
        .catch(err => console.error(err));
    } else {
      setDoctors([]);
    }
    setSelectedDoctor('');
  }, [selectedSpecialty]);

  // Load available times khi chọn bác sĩ + ngày
  useEffect(() => {
    if(selectedDoctor && appointmentDate) {
      axios.get(`/appointments/available?doctor=${selectedDoctor}&date=${appointmentDate}`)
        .then(res => setAvailableTimes(res.data))
        .catch(err => console.error(err));
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
    if(!selectedLocation || !selectedSpecialty || !selectedDoctor || !appointmentDate || !selectedTime){
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        location: selectedLocation,
        specialty: selectedSpecialty,
        doctor: selectedDoctor,
        date: appointmentDate,
        time: selectedTime,
        patient: patientInfo
      };
      await axios.post('/appointments', payload);
      setSuccess('Đặt lịch thành công!');
      setError(null);
      // Reset form
      setSelectedLocation('');
      setSelectedSpecialty('');
      setSelectedDoctor('');
      setAppointmentDate('');
      setSelectedTime('');
      setPatientInfo({
        fullName: '',
        gender: '',
        dob: '',
        phone: '',
        email: '',
        reason: ''
      });
    } catch(err) {
      console.error(err);
      setError('Đặt lịch thất bại, vui lòng thử lại');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label>Cơ sở y tế</label>
        <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
          <option value="">Chọn cơ sở y tế</option>
          {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
        </select>

        <label>Chuyên khoa</label>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}>
          <option value="">Chọn chuyên khoa</option>
          {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <label>Bác sĩ</label>
        <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
          <option value="">Chọn bác sĩ</option>
          {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
        </select>

        <label>Ngày khám</label>
        <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />

        <label>Chọn giờ</label>
        <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
          <option value="">Chọn giờ khám</option>
          {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
        </select>

        <h3>Thông tin bệnh nhân</h3>
        <input type="text" name="fullName" placeholder="Họ tên" value={patientInfo.fullName} onChange={handlePatientChange} />
        <select name="gender" value={patientInfo.gender} onChange={handlePatientChange}>
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </select>
        <input type="date" name="dob" value={patientInfo.dob} onChange={handlePatientChange} />
        <input type="text" name="phone" placeholder="Số điện thoại" value={patientInfo.phone} onChange={handlePatientChange} />
        <input type="email" name="email" placeholder="Email" value={patientInfo.email} onChange={handlePatientChange} />
        <textarea name="reason" placeholder="Lý do khám" value={patientInfo.reason} onChange={handlePatientChange} />

        <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Đặt lịch'}</button>
      </form>
    </div>
  );
};

export default BookingForm;
