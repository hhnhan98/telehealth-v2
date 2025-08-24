import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';

function MedicalRecordList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axiosInstance.get('/medical-records');
        setRecords(res.data);
      } catch (error) {
        console.error('Lỗi khi tải hồ sơ bệnh án:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Danh sách Hồ sơ bệnh án</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : records.length === 0 ? (
        <p>Không có hồ sơ bệnh án nào.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Ngày khám</th>
              <th className="border p-2">Bác sĩ</th>
              <th className="border p-2">Chẩn đoán</th>
              <th className="border p-2">Ghi chú</th>
              <th className="border p-2">Xem chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                <td className="border p-2">{new Date(record.date).toLocaleDateString()}</td>
                <td className="border p-2">{record.doctor?.fullName || '---'}</td>
                <td className="border p-2">{record.diagnosis}</td>
                <td className="border p-2">{record.notes}</td>
                <td className="border p-2">
                  <Link
                    to={`/patient/medical-records/${record._id}`}
                    className="text-blue-600 underline"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MedicalRecordList;