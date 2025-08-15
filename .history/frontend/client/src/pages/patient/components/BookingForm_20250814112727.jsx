import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './BookingForm.css';

const BookingForm = ({ currentUser }) => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

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

  // === Load danh sách cơ sở y tế ===
  useEffect(() => {
    axios.get('/booking/locations')
      .then(res => setLocations(res.data))
      .catch(err => console.error('Lỗi load cơ sở y tế:', err));
  }, []);

  // === Load danh sách chuyên khoa theo location (fix lỗi 400) ===
  useEffect(() => {
    if (!bookingData.location) {
      // Nếu chưa chọn cơ sở, reset danh sách chuyên khoa
      setSpecialties([]);
      setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
      return;
    }

    // Gọi API khi đã có locationId
    axios.get(`/booking/specialties?locationId=${bookingData.location}`)
      .then(res => setSpecialties(res.data))
      .catch(err => {
        console.error('Lỗi load chuyên khoa:', err);
        setSpecialties([]);
      });

    // Reset specialty + doctor khi đổi location
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
  }, [bookingData.location]);

  // === Pre-fill thông tin bệnh nhân từ currentUser ===
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

  // === Load bác sĩ theo location + specialty ===
useEffect(() => {
  if (!bookingData.location) {
    setSpecialties([]);
    setDoctors([]);
    setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
    return;
  }

  // Load chuyên khoa theo location
  axios.get('/booking/specialties') // nếu API chưa hỗ trợ filter location
    .then(res => {
      // Lọc frontend theo location nếu server trả tất cả
      const filtered = res.data.filter(s => s.locationIds?.includes(bookingData.location));
      setSpecialties(filtered);
    })
    .catch(err => {
      console.error('Lỗi load chuyên khoa:', err);
      setSpecialties([]);
    });

  setBookingData(prev => ({ ...prev, specialty: '', doctor: '' }));
  setDoctors([]);
}, [bookingData.location]);


  // === Load giờ trống theo bác sĩ + ngày ===
  useEffect(() => {
    if (bookingData.doctor && bookingData.date) {
      axios.get(`/booking/available?doctorId=${bookingData.doctor}&date=${bookingData.date}`)
        .then(res => setAvailableTimes(res.data))
        .catch(err => {
          console.error('Lỗi load giờ trống:', err);
          setAvailableTimes([]);
        });
      setBookingData(prev => ({ ...prev, time: '' }));
    } else {
      setAvailableTimes([]);
      setBookingData(prev => ({ ...prev, time: '' }));
    }
  }, [bookingData.doctor, bookingData.date]);

  // === Xử lý thay đổi thông tin bệnh nhân ===
  const handlePatientChange = e => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      patient: { ...prev.patient, [name]: value }
    }));
  };

  // === Validate form trước khi submit ===
  const validateForm = () => {
    const { location, specialty, doctor, date, time, patient } = bookingData;
    if (!location || !specialty || !doctor || !date || !time) {
      setToast({ message: 'Vui lòng chọn đầy đủ thông tin khám.', type: 'error' });
      return false;
    }
    if (!patient.fullName || !patient.gender || !patient.dob) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin bệnh nhân.', type: 'error' });
      return false;
    }
    return true;
  };

  // === Submit form ===
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { location, specialty, doctor, date, time, patient } = bookingData;
      await axios.post('/appointments', { location, specialty, doctor, date, time, patient });
      setToast({ message: 'Đặt lịch thành công!', type: 'success' });

      // Reset form sau submit
      setBookingData(prev => ({
        location: '',
        specialty: '',
        doctor: '',
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
      setDoctors([]);
      setSpecialties([]);
      setAvailableTimes([]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Đặt lịch thất bại, vui lòng thử lại.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Đặt lịch khám bệnh</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Cơ sở y tế</label>
        <select value={bookingData.location} onChange={e => setBookingData({ ...bookingData, location: e.target.value })}>
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
          {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
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

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Đặt lịch'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
