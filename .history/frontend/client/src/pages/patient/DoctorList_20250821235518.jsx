// src/pages/patient/PatientDoctors.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/doctors';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(API_BASE);
        setDoctors(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi lấy danh sách bác sĩ:', err);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <p>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p>Hiện chưa có bác sĩ nào.</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '10px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Danh sách bác sĩ</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {doctors.map((doctor) => (
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
            {/* Avatar */}
            <img
              src={doctor.user.avatar || '/default-avatar.png'}
              alt="avatar"
              width={100}
              height={100}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />

            {/* Tên bác sĩ */}
            <h3 style={{ margin: '10px 0' }}>{doctor.user.fullName}</h3>

            {/* Chuyên khoa */}
            <p>
              <strong>Chuyên khoa:</strong> {doctor.specialty?.name || 'Chưa cập nhật'}
            </p>

            {/* Cơ sở y tế */}
            <p>
              <strong>Cơ sở:</strong> {doctor.location?.name || 'Chưa cập nhật'}
            </p>

            {/* Bio */}
            {doctor.user.bio && (
              <p style={{ fontStyle: 'italic', marginTop: '10px' }}>{doctor.user.bio}</p>
            )}

            {/* Nút đặt lịch */}
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

export default PatientDoctors;
