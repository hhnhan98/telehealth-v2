import React, { useEffect, useState, useCallback } from 'react';
import medicalRecordService from '../../services/medicalRecordService';
import DoctorMedicalRecordDetail from './DoctorMedicalRecordDetail';
import './styles/DoctorMedicalRecordList.css';

const DoctorMedicalRecordList = ({ patient, onClose }) => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

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
  }, [patient?._id]);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const handleRecordAdded = (newRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setTotal(prev => prev + 1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="medical-record-list">
      <div className="header">
        <h3>Lịch sử khám: {patient?.fullName}</h3>
        <button className="btn-close" onClick={onClose}>Đóng</button>
      </div>

      {loading && <p className="loading">Đang tải dữ liệu...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {records.length === 0 ? (
            <p className="no-record">Chưa có lịch sử khám</p>
          ) : (
            <div className="table-wrapper">
              <table className="table-common">
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
                    <tr key={r._id} className={selectedRecord?._id === r._id ? 'selected' : ''}>
                      <td>{r.appointment?.date} {r.appointment?.time}</td>
                      <td>{r.doctorName}</td>
                      <td>{r.specialtyName}</td>
                      <td>{r.locationName}</td>
                      <td>
                        <button className="btn-view" onClick={() => setSelectedRecord(r)}>
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          onRecordSaved={handleRecordAdded}
          isOpen={!!selectedRecord}
        />
      )}
    </div>
  );
};

export default DoctorMedicalRecordList;
