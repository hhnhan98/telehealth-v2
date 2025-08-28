// ===== LỊCH SỬ KHÁM CỦA BỆNH NHÂN =====
import React, { useEffect, useState, useCallback } from 'react';
import medicalRecordService from '../../services/medicalRecordService';
import MedicalRecordDetail from './DoctorMedicalRecordDetail';

const DoctorMedicalRecordList = ({ patient, onClose }) => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // useCallback để tránh ESLint warning
  const fetchRecords = useCallback(async (pageNumber = 1) => {
    if (!patient?._id) return;
    setLoading(true);
    setError('');

    try {
      const res = await medicalRecordService.getMedicalRecordsByPatient(patient._id, { page: pageNumber, limit });
      if (res.success) {
        setRecords(res.data.records || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || 1);
      } else {
        setError(res.message || 'Lỗi khi tải dữ liệu');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [patient?._id]); // dependency patient._id

  // gọi khi patient thay đổi
  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  // Hàm thêm record mới vào state ngay khi lưu phiếu khám xong
  const handleRecordAdded = (newRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setTotal(prev => prev + 1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="medical-record-list">
      <h3>Lịch sử khám: {patient?.fullName}</h3>
      <button onClick={onClose}>Đóng</button>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {records.length === 0 ? (
            <p>Chưa có lịch sử khám</p>
          ) : (
            <table className="record-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Bác sĩ</th>
                  <th>Chuyên khoa</th>
                  <th>Cơ sở</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                  <td>{r.appointment?.date} {r.appointment?.time}</td>
                  <td>{r.doctor?.fullName || '-'}</td>
                  <td>{r.doctor?.specialty || '-'}</td>
                  <td>{r.doctor?.location || '-'}</td>
                  <td>
                      <button onClick={() => setSelectedRecord(r)}>Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => fetchRecords(page - 1)}>Prev</button>
              <span> {page} / {totalPages} </span>
              <button disabled={page >= totalPages} onClick={() => fetchRecords(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {selectedRecord && (
        <MedicalRecordDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onRecordSaved={handleRecordAdded} // truyền callback để thêm record mới
        />
      )}
    </div>
  );
};

export default DoctorMedicalRecordList;
