// src/pages/patient/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        console.log('API raw response:', res.data);

        const data = Array.isArray(res.data.data?.doctors) ? res.data.data.doctors : [];
        console.log('Parsed doctors array length:', data.length);

        data.forEach((doc, index) => {
          console.log(`Doctor #${index + 1}:`);
          console.log('Full object:', doc);
          console.log('user field:', doc.user);
          console.log('user.fullName:', doc.user?.fullName);
          console.log('user.avatar:', doc.user?.avatar);
          console.log('specialty.name:', doc.specialty?.name);
          console.log('location.name:', doc.location?.name);
          console.log('bio:', doc.bio);
        });

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
    navigate(`/appointment/${doctorId}`);
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chưa có bác sĩ nào trong hệ thống.</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 15px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Danh sách bác sĩ</h2>

      {/* Filter Panel */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px',
        justifyContent: 'center',
      }}>
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
          style={{ minWidth: '180px', padding: '5px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>

      {/* Doctor Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {filteredDoctors.map(doc => {
          // ----- DEBUG LOG -----
          console.log('Rendering doctor:', doc._id);
          console.log('Avatar URL:', doc.user?.avatar);
          console.log('Full Name:', doc.user?.fullName);

          return (
            <div
              key={doc._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Avatar */}
              {doc.user?.avatar ? (
                <img
                src={doc.user?.avatar ? `${API_BASE.replace('/users','')}${doc.user.avatar.startsWith('/') ? '' : '/'}${doc.user.avatar}` : undefined}
                alt={doc.user?.fullName || 'Bác sĩ'}
                width={120}
                height={120}
                style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }}
                onError={(e) => {
                    console.warn('Avatar load failed for doctor:', doc._id, 'URL:', e.target.src);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/120?text=No+Image';
                }}
                />
              ) : (
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  color: '#fff',
                  fontWeight: '600',
                  marginBottom: '15px',
                }}>
                  {doc.user?.fullName?.charAt(0) || 'B'}
                </div>
              )}

              <h3 style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' }}>
                {doc.user?.fullName || '-'}
              </h3>
              <p style={{ margin: '5px 0', fontWeight: '500', color: '#1E3A8A', textAlign: 'center' }}>
                {doc.specialty?.name || '-'}
              </p>
              <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#555', textAlign: 'center' }}>
                {doc.location?.name || '-'}
              </p>
              <p style={{
                margin: '10px 0',
                fontSize: '0.9rem',
                color: '#333',
                textAlign: 'center',
              }}>
                {doc.bio || 'Chưa có thông tin bio'}
              </p>
              <button
                onClick={() => handleBook(doc._id)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  fontWeight: '500',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#43A047'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Đặt lịch ngay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorList;
