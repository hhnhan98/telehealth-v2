// src/pages/patient/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/users';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_BASE}/doctors`);
        console.log('API response:', res.data);

        // Lấy đúng field chứa mảng bác sĩ (ví dụ backend trả về res.data.doctors)
        const data = Array.isArray(res.data.data?.doctors) ? res.data.data.doctors : [];
       
        console.log('Parsed doctors array:', data);

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

  const handleBook = (doctorId) => {
    navigate(`/appointment/${doctorId}`);
  };

  if (loading)
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải danh sách bác sĩ...</p>;

  if (!doctors.length)
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chưa có bác sĩ nào trong hệ thống.</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 15px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Danh sách bác sĩ</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {doctors.map((doc) => (
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
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <img
              src={doc.user?.avatar || 'https://via.placeholder.com/120'}
              alt={doc.user?.fullName || 'Bác sĩ'}
              width={120}
              height={120}
              style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }}
            />
            <h3 style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '600' }}>
              {doc.user?.fullName || '-'}
            </h3>
            <p style={{ margin: '5px 0', fontWeight: '500', color: '#1E3A8A' }}>
              {doc.specialty?.name || '-'}
            </p>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#555' }}>
              {doc.location?.name || '-'}
            </p>
            <p
              style={{
                margin: '10px 0',
                fontSize: '0.9rem',
                color: '#333',
                textAlign: 'center',
              }}
            >
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
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#43A047')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              Đặt lịch ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
