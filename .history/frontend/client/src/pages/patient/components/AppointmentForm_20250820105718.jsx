// src/pages/AppointmentForm.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  fetchLocations,
  fetchSpecialties,
  fetchDoctors,
  getAvailableSlots,
  createAppointment,
} from '../../../services/bookingService';

const AppointmentForm = () => {
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const specialtiesCache = useRef({});
  const doctorsCache = useRef({});

  const [bookingData, setBookingData] = useState({
    location: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
  });

  // Load cơ sở
  useEffect(() => {
    const loadLocations = async () => {
      const res = await fetchLocations();
      setLocations(res || []);
    };
    loadLocations();
  }, []);

  // Khi chọn location → load specialties
  useEffect(() => {
    if (!bookingData.location) return;

    const loadSpecialties = async () => {
      if (specialtiesCache.current[bookingData.location]) {
        setSpecialties(specialtiesCache.current[bookingData.location]);
        return;
      }

      const res = await fetchSpecialties(bookingData.location); // ✅ truyền locationId
      const list = Array.isArray(res) ? res : [];
      setSpecialties(list);
      specialtiesCache.current[bookingData.location] = list;
    };

    loadSpecialties();
  }, [bookingData.location]);

  // Khi chọn specialty → load doctors
  useEffect(() => {
    if (!bookingData.location || !bookingData.specialty) return;

    const key = `${bookingData.location}_${bookingData.specialty}`;
    if (doctorsCache.current[key]) {
      setDoctors(doctorsCache.current[key]);
      return;
    }

    const loadDoctors = async () => {
      const res = await fetchDoctors(bookingData.location, bookingData.specialty); // ✅ truyền 2 param
      const list = Array.isArray(res) ? res : [];
      setDoctors(list);
      doctorsCache.current[key] = list;
    };

    loadDoctors();
  }, [bookingData.location, bookingData.specialty]);

  // Khi chọn doctor + date → load available slots
  useEffect(() => {
    if (!bookingData.doctor || !bookingData.date) return;

    const loadAvailableSlots = async () => {
      const res = await getAvailableSlots(bookingData.doctor, bookingData.date);
      const list = Array.isArray(res) ? res : [];
      setAvailableTimes(list);
    };

    loadAvailableSlots();
  }, [bookingData.doctor, bookingData.date]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateTime = new Date(`${bookingData.date}T${bookingData.time}:00`);

    const payload = {
      doctorId: bookingData.doctor,
      locationId: bookingData.location,
      specialtyId: bookingData.specialty,
      dateTime,
    };

    const res = await createAppointment(payload);
    if (res?.success) {
      alert('Đặt lịch thành công!');
    } else {
      alert(res?.message || 'Có lỗi xảy ra khi đặt lịch!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đặt lịch khám</h2>

      {/* Cơ sở */}
      <select
        value={bookingData.location}
        onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
      >
        <option value="">-- Chọn cơ sở --</option>
        {locations.map((loc) => (
          <option key={loc._id} value={loc._id}>
            {loc.name}
          </option>
        ))}
      </select>

      {/* Chuyên khoa */}
      <select
        value={bookingData.specialty}
        onChange={(e) => setBookingData({ ...bookingData, specialty: e.target.value })}
        disabled={!bookingData.location}
      >
        <option value="">-- Chọn chuyên khoa --</option>
        {specialties.map((spec) => (
          <option key={spec._id} value={spec._id}>
            {spec.name}
          </option>
        ))}
      </select>

      {/* Bác sĩ */}
      <select
        value={bookingData.doctor}
        onChange={(e) => setBookingData({ ...bookingData, doctor: e.target.value })}
        disabled={!bookingData.specialty}
      >
        <option value="">-- Chọn bác sĩ --</option>
        {doctors.map((doc) => (
          <option key={doc._id} value={doc._id}>
            {doc.user?.fullName}
          </option>
        ))}
      </select>

      {/* Ngày */}
      <input
        type="date"
        value={bookingData.date}
        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
      />

      {/* Giờ */}
      <select
        value={bookingData.time}
        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
        disabled={!availableTimes.length}
      >
        <option value="">-- Chọn giờ khám --</option>
        {availableTimes.map((t, i) => (
          <option key={i} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button type="submit">Đặt lịch</button>
    </form>
  );
};

export default AppointmentForm;
