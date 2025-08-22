import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/users';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách bác sĩ từ BE
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/doctors`);
      setDoctors(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi lấy danh sách bác sĩ:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) return <p>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p>Chưa có bác sĩ nào.</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
      {doctors.map((doc, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
          {/* Avatar */}
          {doc.user.avatar ? (
            <img src={doc.user.avatar} alt={doc.user.fullName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#eee', marginBottom: '10px' }} />
          )}
          {/* Name */}
          <h3 style={{ textAlign: 'center', margin: '5px 0' }}>{doc.user.fullName}</h3>
          {/* Specialty */}
          <p style={{ margin: '2px 0', fontWeight: 'bold', color: '#555' }}>{doc.specialty?.name || 'Chưa có chuyên khoa'}</p>
          {/* Location */}
          <p style={{ margin: '2px 0', color: '#777' }}>{doc.location?.name || 'Chưa có cơ sở'}</p>
          {/* Bio */}
          <p style={{ margin: '10px 0', textAlign: 'center', fontSize: '0.9rem', color: '#666', minHeight: '40px' }}>
            {doc.user.bio || 'Chưa có thông tin bio'}
          </p>
          {/* Button đặt lịch */}
          <button
            onClick={() => navigate(`/appointments/new?doctorId=${doc._id}`)}
            style={{ marginTop: 'auto', padding: '8px 15px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Đặt lịch
          </button>
        </div>
      ))}
    </div>
  );
};

export default DoctorList;
