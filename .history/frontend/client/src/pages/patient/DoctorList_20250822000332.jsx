import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/users';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách bác sĩ
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/doctors`);
      const data = res.data.data || [];
      setDoctors(data);
      setFilteredDoctors(data);

      // Lấy danh sách chuyên khoa duy nhất để filter
      const uniqueSpecialties = Array.from(
        new Set(data.map((doc) => doc.specialty?.name).filter(Boolean))
      );
      setSpecialties(uniqueSpecialties);

      setLoading(false);
    } catch (err) {
      console.error('Lỗi lấy danh sách bác sĩ:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Lọc theo chuyên khoa
  useEffect(() => {
    if (selectedSpecialty === 'all') {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(doc => doc.specialty?.name === selectedSpecialty));
    }
  }, [selectedSpecialty, doctors]);

  if (loading) return <p>Đang tải danh sách bác sĩ...</p>;
  if (!doctors.length) return <p>Chưa có bác sĩ nào.</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto' }}>
      {/* Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="specialtyFilter" style={{ fontWeight: 'bold' }}>Chuyên khoa:</label>
        <select
          id="specialtyFilter"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">Tất cả</option>
          {specialties.map((s, idx) => (
            <option key={idx} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Grid bác sĩ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredDoctors.map((doc, idx) => (
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
    </div>
  );
};

export default DoctorList;
