import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const MedicalRecordDetail = () => {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`/api/medicalRecords/${recordId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setRecord(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải hồ sơ bệnh án');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  if (loading) return <p>Đang tải hồ sơ...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!record) return <p>Không tìm thấy hồ sơ bệnh án.</p>;

  return (
    <div>
      <h2>Chi tiết hồ sơ bệnh án</h2>
      <p><strong>Bệnh nhân:</strong> {record.patient?.fullName || 'N/A'}</p>
      <p><strong>Bác sĩ:</strong> {record.doctor?.fullName || 'N/A'}</p>
      <p><strong>Ngày tạo:</strong> {new Date(record.createdAt).toLocaleString()}</p>
      <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
      <p><strong>Đơn thuốc:</strong> {record.prescription || 'Không có'}</p>
      <p><strong>Ghi chú:</strong> {record.notes || 'Không có'}</p>
    </div>
  );
};

export default MedicalRecordDetail;
