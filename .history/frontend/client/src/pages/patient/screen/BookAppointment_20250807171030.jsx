import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';

function BookAppointment() {
  const [specialties, setSpecialties] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [note, setNote] = useState('');

  // 📌 Lấy danh sách chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axios.get('/specialties');
        setSpecialties(res.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chuyên khoa:', error);
      }
    };
    fetchSpecialties();
  }, []);

  // 📌 Lấy danh sách bác sĩ theo chuyên khoa
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!specialty) {
        setDoctors([]);
        setDoctor('');
        return;
      }

      try {
        const res = await axios.get(`/users/doctors?specialty=${encodeURIComponent(specialty)}`);
        setDoctors(res.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bác sĩ:', error);
      }
    };
    fetchDoctors();
  }, [specialty]);

  // 🔁 useEffect lấy lịch rảnh
useEffect(() => {
  const fetchAvailableSlots = async () => {
    if (!doctor || !date) {
      setAvailableSlots([]);
      return;
    }

    try {
      const res = await axios.get(`/schedule/${doctor}?date=${date}`);
      setAvailableSlots(res.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy lịch rảnh:', error);
      setAvailableSlots([]);
    }
  };

  fetchAvailableSlots();
}, [doctor, date]);

  // 📌 Gửi form đặt lịch
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctor || !date || !timeSlot) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const datetimeISO = new Date(`${date}T${timeSlot}`).toISOString();

      const payload = {
        doctor,
        date: datetimeISO,
        reason: note
      };

      const response = await axios.post('/appointments', payload);

      if (response.status === 201) {
        alert('Đặt lịch thành công!');
        setSpecialty('');
        setDoctor('');
        setDate('');
        setTimeSlot('');
        setNote('');
        setAvailableSlots([]);
      } else {
        alert(`Lỗi: ${response.data.message || 'Đặt lịch thất bại'}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi đặt lịch:', error);
      if (error.response) {
        alert(`Lỗi: ${error.response.data.error || 'Đặt lịch thất bại'}`);
      } else {
        alert('Lỗi kết nối đến máy chủ');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
        Đặt lịch khám
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Chuyên khoa */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold' }}>Chuyên khoa:</label><br />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          >
            <option value="">-- Chọn chuyên khoa --</option>
            {specialties.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Bác sĩ */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold' }}>Bác sĩ:</label><br />
          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
            disabled={!specialty}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.fullName}</option>
            ))}
          </select>
        </div>

        {/* Ngày khám */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold' }}>Chọn ngày:</label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px', width: '100%' }}
            required
          />
        </div>

        {/* Khung giờ khả dụng */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold' }}>Chọn giờ khám:</label><br />
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
            disabled={!availableSlots.length}
          >
            <option value="">-- Chọn khung giờ --</option>
            {availableSlots.map((slot, index) => (
              <option key={index} value={slot}>{slot}</option>
            ))}
          </select>
          {doctor && date && availableSlots.length === 0 && (
            <div style={{ color: 'red', marginTop: '8px' }}>
              Bác sĩ không có lịch rảnh hôm nay
            </div>
          )}
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>Ghi chú / Triệu chứng:</label><br />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="4"
            placeholder="Vui lòng ghi rõ triệu chứng..."
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          style={{
            backgroundColor: '#59c2ff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Đặt lịch
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;
