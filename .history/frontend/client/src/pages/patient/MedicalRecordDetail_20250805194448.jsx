import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

function MedicalRecordDetail() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axiosInstance.get(`/medical-records/${id}`);
        setRecord(res.data);
      } catch (error) {
        console.error('Lỗi khi tải hồ sơ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
  if (!record) return <div className="p-6">Không tìm thấy hồ sơ bệnh án.</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Chi tiết Hồ sơ bệnh án</h2>

      <div className="space-y-4 border rounded-lg p-4 bg-white shadow">
        <div>
          <strong>Ngày khám:</strong> {new Date(record.date).toLocaleDateString()}
        </div>
        <div>
          <strong>Bác sĩ:</strong> {record.doctor?.fullName || 'Không rõ'}
        </div>
        <div>
          <strong>Chẩn đoán:</strong> {record.diagnosis}
        </div>
        <div>
          <strong>Ghi chú:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">{record.notes || 'Không có'}</div>
        </div>
        <div>
          <strong>Đơn thuốc:</strong>
          {record.prescriptions && record.prescriptions.length > 0 ? (
            <ul className="list-disc list-inside pl-4">
              {record.prescriptions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>Không có đơn thuốc.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link to="/patient/medical-records" className="text-blue-600 underline">
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}

export default MedicalRecordDetail;