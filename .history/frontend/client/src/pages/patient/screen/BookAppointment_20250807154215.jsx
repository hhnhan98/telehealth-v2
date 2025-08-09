import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';

function BookAppointment() {
  const [specialties, setSpecialties] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [doctor, setDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  // Lấy danh sách chuyên khoa từ backend
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

  // Khi chọn chuyên khoa → lấy danh sách bác sĩ theo chuyên khoa
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!specialty) {
        setDoctors([]);
        setDoctor('');
        return;
      }

      try {
        const res = await axios.get(`/users/doctor/by-specialty?specialty=${encodeURIComponent(specialty)}`);
        setDoctors(res.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bác sĩ:', error);
      }
    };

    fetchDoctors();
  }, [specialty]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/appointments', {
        specialty,
        doctor,
        date: new Date(`${date}T${time}`),
        note
      });

      if (response.status === 201) {
        alert('Đặt lịch thành công!');
        // Reset form
        setSpecialty('');
        setDoctor('');
        setDate('');
        setTime('');
        setNote('');
      } else {
        alert(`Lỗi: ${response.data.message || 'Đặt lịch thất bại'}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi đặt lịch:', error);
      alert('Đã xảy ra lỗi khi gửi dữ liệu');
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
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={{ width: '100%', padding: '8px' }}>
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
            disabled={!specialty}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Ngày giờ */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: 'bold' }}>Chọn ngày/giờ:</label><br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '8px', marginRight: '12px' }}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: '8px' }}
            required
          />
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

        {/* Nút submit */}
        <button
          type="submit"
          style={{
            backgroundColor: '#59c2ffff',
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