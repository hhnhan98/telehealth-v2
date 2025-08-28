// ===== LỊCH SỬ KHÁM =====
import React, { useEffect, useState } from 'react';
import { getMedicalRecordsByPatient } from '../../services/patientService';
import MedicalRecordDetail from './MedicalRecordDetail';

const MedicalRecordHistory = ({ patient, onClose }) => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMedicalRecordsByPatient(patient._id);
        if (res.success) {
          setRecords(res.data);
        } else {
          setError(res.message || 'Lỗi khi tải dữ liệu');
        }
      } catch (err) {
        console.error(err);
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (patient?._id) {
      fetchRecords();
    }
  }, [patient]);

  return (
    <div className="medical-record-list">
      <h3>Lịch sử khám: {patient.fullName}</h3>
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
                    <td>{r.doctor?.fullName}</td>
                    <td>{r.appointment?.specialty?.name || '-'}</td>
                    <td>{r.appointment?.location?.name || '-'}</td>
                    <td>
                      <button onClick={() => setSelectedRecord(r)}>Xem chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {selectedRecord && (
        <MedicalRecordDetail
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default MedicalRecordHistory;
