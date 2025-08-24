
// src/pages/patient/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/DoctorList.css';

const API_BASE = 'http://localhost:5000/api/users';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: 'all',
    location: 'all',
    name: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/doctors`);
        const data = Array.isArray(res.data.data?.doctors) ? res.data.data.doctors : [];
        setDoctors(data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi lấy danh sách bác sĩ:', err);
        setDoctors([]);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialties = Array.from(new Set(doctors.map(d => d.specialty?.name).filter(Boolean)));
  const locations = Array.from(new Set(doctors.map(d => d.location?.name).filter(Boolean)));

  const filteredDoctors = doctors.filter(doc => {
    if (filters.specialty !== 'all' && doc.specialty?.name !== filters.specialty) return false;
    if (filters.location !== 'all' && doc.location?.name !== filters.location) return false;
    if (filters.name.trim() && !doc.user?.fullName?.toLowerCase().includes(filters.name.toLowerCase())) return false;
    return true;
  });

  const handleBook = (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
    } else {
        navigate(`/patient/appointment/${doctorId}`);
    }
  };

  if (loading) return <p className="loading-text">Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p className="loading-text">Chưa có bác sĩ nào trong hệ thống.</p>;

  return (
    <div className="doctor-list-container">
      <h2>Danh sách bác sĩ</h2>

      {/* Filters */}
      <div className="doctor-filters">
        <select
          value={filters.specialty}
          onChange={e => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
        >
          <option value="all">Tất cả chuyên khoa</option>
          {specialties.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.location}
          onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
        >
          <option value="all">Tất cả cơ sở</option>
          {locations.map((l, idx) => <option key={idx} value={l}>{l}</option>)}
        </select>

        <input
          type="text"
          placeholder="Tìm tên bác sĩ..."
          value={filters.name}
          onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Doctor Cards */}
      <div className="doctor-cards">
        {filteredDoctors.map(doc => (
          <div key={doc._id} className="doctor-card">
            <div className="doctor-avatar-wrapper">
              {doc.user?.avatar ? (
                <img
                  src={doc.user.avatar}
                  alt={doc.user.fullName}
                  className="doctor-avatar"
                  loading="lazy"
                />
              ) : (
                <div className="doctor-avatar-placeholder">
                  {doc.user?.fullName?.charAt(0) || 'B'}
                </div>
              )}
            </div>
            <h3>{doc.user?.fullName || '-'}</h3>
            <p className="doctor-specialty">{doc.specialty?.name || '-'}</p>
            <p className="doctor-location">{doc.location?.name || '-'}</p>
            <p className="doctor-bio">{doc.bio || 'Chưa có thông tin bio'}</p>
            <button onClick={() => handleBook(doc._id)}>Đặt lịch ngay</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
