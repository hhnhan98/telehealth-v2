// src/pages/patient/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/users';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filters, setFilters] = useState({
    specialty: 'all',
    location: 'all',
    name: '',
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // --- Fetch danh sách bác sĩ ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/doctors`);
        // đảm bảo doctors luôn là array
        const data = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
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

  // --- Tạo danh sách specialty/location duy nhất cho dropdown ---
  const specialties = Array.from(
    new Set(doctors.map((doc) => doc.specialty?.name).filter(Boolean))
  );
  const locations = Array.from(
    new Set(doctors.map((doc) => doc.location?.name).filter(Boolean))
  );

  // --- Filter bác sĩ ---
  useEffect(() => {
    let filtered = doctors;

    if (filters.specialty !== 'all') {
      filtered = filtered.filter((doc) => doc.specialty?.name === filters.specialty);
    }
    if (filters.location !== 'all') {
      filtered = filtered.filter((doc) => doc.location?.name === filters.location);
    }
    if (filters.name.trim() !== '') {
      const keyword = filters.name.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.user?.fullName?.toLowerCase().includes(keyword)
      );
    }

    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  const handleBook = (doctorId) => {
    navigate(`/appointment/${doctorId}`);
  };

  if (loading) return <p>Đang tải danh sách bác sĩ...</p>;
  if (!Array.isArray(filteredDoctors) || filteredDoctors.length === 0)
    return <p>Chưa có bác sĩ nào.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 15px' }}>
      <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Danh sách bác sĩ</h2>

      {/* Filter */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <select
          value={filters.specialty}
          onChange={(e) => setFilters((prev) => ({ ...prev, specialty: e.target.value }))}
        >
          <option value="all">Tất cả chuyên khoa</option>
          {specialties.map((s, idx) => (
            <option key={idx} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        >
          <option value="all">Tất cả cơ sở</option>
          {locations.map((l, idx) => (
            <option key={idx} value={l}>
              {l}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm tên bác sĩ..."
          value={filters.name}
          onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Doctor Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '15px',
        }}
      >
        {Array.isArray(filteredDoctors) &&
          filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: '#fff',
              }}
            >
              <img
                src={doc.user?.avatar || 'https://via.placeholder.com/100'}
                alt={doc.user?.fullName || 'Bác sĩ'}
                width={100}
                height={100}
                style={{ borderRadius: '50%', marginBottom: '10px', objectFit: 'cover' }}
              />
              <h3 style={{ margin: '5px 0' }}>{doc.user?.fullName || '-'}</h3>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                {doc.specialty?.name || '-'}
              </p>
              <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#555' }}>
                {doc.location?.name || '-'}
              </p>
              <p style={{ margin: '10px 0', fontSize: '0.9rem', color: '#333' }}>
                {doc.bio || 'Chưa có thông tin bio'}
              </p>
              <button
                onClick={() => handleBook(doc._id)}
                style={{
                  padding: '8px 12px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                }}
              >
                Đặt lịch
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DoctorList;
