// src/pages/patient/PatientDoctors.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/doctors';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState({ specialty: '', location: '' });

  const navigate = useNavigate();

  // Lấy danh sách bác sĩ
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(API_BASE);
        setDoctors(res.data.data);
        setFilteredDoctors(res.data.data);

        // Lấy danh sách chuyên khoa và cơ sở có trong dữ liệu
        const specs = [...new Set(res.data.data.map(d => d.specialty?.name).filter(Boolean))];
        const locs = [...new Set(res.data.data.map(d => d.location?.name).filter(Boolean))];
        setSpecialties(specs);
        setLocations(locs);

        setLoading(false);
      } catch (err) {
        console.error('Lỗi lấy danh sách bác sĩ:', err);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Cập nhật danh sách bác sĩ theo filter
  useEffect(() => {
    let filtered = doctors;
    if (filter.specialty) {
      filtered = filtered.filter(d => d.specialty?.name === filter.specialty);
    }
    if (filter.location) {
      filtered = filtered.filter(d => d.location?.name === filter.location);
    }
    setFilteredDoctors(filtered);
  }, [filter, doctors]);

  if (loading) return <p>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p>Hiện chưa có bác sĩ nào.</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '10px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Danh sách bác sĩ</h2>

      {/* Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <select value={filter.specialty} onChange={e => setFilter(prev => ({ ...prev, specialty: e.target.value }))}>
          <option value="">Tất cả chuyên khoa</option>
          {specialties.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filter.location} onChange={e => setFilter(prev => ({ ...prev, location: e.target.value }))}>
          <option value="">Tất cả cơ sở</option>
          {locations.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Doctor cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={doctor.user.avatar || '/default-avatar.png'}
              alt="avatar"
              width={100}
              height={100}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <h3 style={{ margin: '10px 0' }}>{doctor.user.fullName}</h3>
            <p><strong>Chuyên khoa:</strong> {doctor.specialty?.name || 'Chưa cập nhật'}</p>
            <p><strong>Cơ sở:</strong> {doctor.location?.name || 'Chưa cập nhật'}</p>
            {doctor.user.bio && <p style={{ fontStyle: 'italic', marginTop: '10px' }}>{doctor.user.bio}</p>}
            <button
              onClick={() => navigate(`/appointment/${doctor._id}`)}
              style={{
                marginTop: '10px',
                padding: '8px 15px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
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
