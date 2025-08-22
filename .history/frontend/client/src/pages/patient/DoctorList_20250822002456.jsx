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

        // đảm bảo luôn là array
        const data = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
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

//   const handleBook = (doctorId) => {
//     navigate(`/appointment/${doctorId}`);
//   };

  console.log('Current doctors state:', doctors);

  if (loading) return <p style={{ textAlign: 'center' }}>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length)
    return <p style={{ textAlign: 'center' }}>Chưa có bác sĩ nào trong hệ thống.</p>;

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
          <div key={doc._id}>
            <h3>{doc.user?.fullName || 'Bác sĩ'}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;
