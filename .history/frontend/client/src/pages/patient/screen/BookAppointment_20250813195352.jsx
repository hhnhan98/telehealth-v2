import React, { useState, useEffect } from 'react';
import { getAllLocations } from '../../../services/locationService';
import { getAllSpecialties } from '../../../services/specialtyService';
import { createAppointment } from '../../../services/appointmentService';

const BookAppointment = () => {
  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    specialtyId: '',
    locationId: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtyData, locationData] = await Promise.all([
          getAllSpecialties(),
          getAllLocations()
        ]);
        setSpecialties(specialtyData);
        setLocations(locationData);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await createAppointment(form);
      setMessage('Đặt lịch thành công!');
      setForm({
        specialtyId: '',
        locationId: '',
        date: '',
        time: ''
      });
    } catch (error) {
      console.error('Lỗi đặt lịch:', error);
      setMessage('Không thể đặt lịch, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Đặt lịch khám</h2>
      <form onSubmit={handleSubmit}>
        <label>Chuyên khoa:</label>
        <select
          name="specialtyId"
          value={form.specialtyId}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn chuyên khoa --</option>
          {specialties.map((spec) => (
            <option key={spec._id} value={spec._id}>
              {spec.name}
            </option>
          ))}
        </select>

        <label>Địa điểm:</label>
        <select
          name="locationId"
          value={form.locationId}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn địa điểm --</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>

        <label>Ngày:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <label>Giờ:</label>
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đặt lịch'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default BookAppointment;
