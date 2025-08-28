import React, { useState, useEffect, useCallback } from 'react';
import medicalRecordService from '../../services/medicalRecordService';
import DoctorMedicalRecordDetail from '../doctor/DoctorMedicalRecordDetail';
import dayjs from 'dayjs';

const PatientMedicalRecordList = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchRecords = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await medicalRecordService.getMyMedicalRecords({ page: pageNumber, limit });
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
  }, []);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="medical-record-list patient-view">
      <h3>Hồ sơ bệnh án của tôi</h3>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {records.length === 0 ? (
            <p>Chưa có hồ sơ bệnh án</p>
          ) : (
            <table className="record-table">
              <thead>
                <tr>
                  <th>Ngày khám</th>
                  <th>Bác sĩ</th>
                  <th>Chuyên khoa</th>
                  <th>Cơ sở</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{r.appointment?.date} {r.appointment?.time}</td>
                    <td>{r.doctorName}</td>
                    <td>{r.specialtyName}</td>
                    <td>{r.locationName}</td>
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
        <DoctorMedicalRecordDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default PatientMedicalRecordList;
