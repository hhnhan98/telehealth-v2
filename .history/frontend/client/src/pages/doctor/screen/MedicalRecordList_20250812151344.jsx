import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const MedicalRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('/medicalRecords');
        setRecords(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải danh sách hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) return <p>Đang tải danh sách hồ sơ...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!records.length) return <p>Chưa có hồ sơ bệnh án nào.</p>;

  return (
    <div>
      <h2>Danh sách hồ sơ bệnh án</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Bệnh nhân</th>
            <th>Bác sĩ</th>
            <th>Ngày tạo</th>
            <th>Chẩn đoán</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec._id}>
              <td>{rec.patient?.fullName || 'N/A'}</td>
              <td>{rec.doctor?.fullName || 'N/A'}</td>
              <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
              <td>{rec.diagnosis}</td>
              <td>
                <Link to={`/doctor/medical-records/${rec._id}`}>Xem chi tiết</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MedicalRecordList;
