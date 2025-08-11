import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';

function BookAppointment() {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [note, setNote] = useState('');

  // Lấy danh sách chuyên khoa
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const res = await axios.get('/specialties');
        setSpecialties(res.data || []);
      } catch (err) {
        console.error('Lấy chuyên khoa lỗi:', err);
      }
    };
    loadSpecialties();
  }, []);

  // Lấy bác sĩ theo chuyên khoa
  useEffect(() => {
    if (!selectedSpecialty) {
      setDoctors([]);
      setSelectedDoctor('');
      return;
    }
    const loadDoctors = async () => {
      try {
        const res = await axios.get(`/users/doctors?specialty=${encodeURIComponent(selectedSpecialty)}`);
        setDoctors(res.data || []);
      } catch (err) {
        console.error('Lấy bác sĩ lỗi:', err);
      }
    };
    loadDoctors();
  }, [selectedSpecialty]);

  // Lấy khung giờ khả dụng
  useEffect(() => {
    if (!selectedDoctor || !date) {
      setAvailableSlots([]);
      return;
    }
    const loadSlots = async () => {
      try {
        const res = await axios.get(`/schedule/available/${selectedDoctor}?date=${date}`);
        setAvailableSlots(res.data?.availableSlots || []);
      } catch (err) {
        console.error('Lấy lịch rảnh lỗi:', err);
        setAvailableSlots([]);
      }
    };
    loadSlots();
  }, [selectedDoctor, date]);

  // Đặt lịch khám
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !selectedTime) {
      alert('Vui lòng chọn đầy đủ chuyên khoa, bác sĩ, ngày và giờ khám');
      return;
    }

    try {
      // Chuyển từ yyyy-mm-dd → dd/mm/yyyy
      const [year, month, day] = date.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const payload = {
        doctorId: selectedDoctor,
        date: formattedDate,     // dd/mm/yyyy
        time: selectedTime,      // HH:mm
        reason: note.trim()
      };

      console.log("Payload gửi lên:", payload); // Debug

      const res = await axios.post('/appointments', payload);

      if (res.status === 201) {
        alert('Đặt lịch thành công!');
        setSelectedSpecialty('');
        setSelectedDoctor('');
        setDate('');
        setSelectedTime('');
        setNote('');
        setAvailableSlots([]);
      } else {
        alert(res.data?.message || 'Đặt lịch không thành công');
      }
    } catch (err) {
      console.error('Lỗi khi đặt lịch:', err);
      const message = err.response?.data?.error || 'Lỗi kết nối đến máy chủ';
      alert(message);
    }
  };


  return (
    <div style={{ maxWidth: 700, margin: '20px auto', padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>Đặt lịch khám</h2>

      <form onSubmit={handleSubmit}>
        {/* Chuyên khoa */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Chuyên khoa</strong></label><br />
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          >
            <option value="">-- Chọn chuyên khoa --</option>
            {specialties.map(sp => (
              <option key={sp._id} value={sp._id}>{sp.name}</option>
            ))}
          </select>
        </div>

        {/* Bác sĩ */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Bác sĩ</strong></label><br />
          <select
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
            disabled={!selectedSpecialty}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map(doc => (
              <option key={doc._id} value={doc._id}>{doc.fullName}</option>
            ))}
          </select>
        </div>

        {/* Ngày khám */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Ngày khám</strong></label><br />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
          />
        </div>

        {/* Giờ khám */}
        <div style={{ marginBottom: 16 }}>
          <label><strong>Chọn giờ khám</strong></label><br />
          <select
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            style={{ width: '100%', padding: 8 }}
            required
            disabled={!availableSlots.length}
          >
            <option value="">-- Chọn khung giờ --</option>
            {availableSlots.map((slot, i) => (
              <option key={i} value={slot}>{slot}</option>
            ))}
          </select>
          {selectedDoctor && date && availableSlots.length === 0 && (
            <div style={{ color: 'red', marginTop: 8 }}>
              Bác sĩ không có lịch rảnh ngày này
            </div>
          )}
        </div>

        {/* Ghi chú */}
        <div style={{ marginBottom: 20 }}>
          <label><strong>Ghi chú / Triệu chứng</strong></label><br />
          <textarea
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Mô tả triệu chứng nếu có"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#59c2ff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 4,
            color: 'white',
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
