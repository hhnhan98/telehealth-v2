import React, { useEffect, useState } from 'react';
import { getPatientsByDoctor } from '../../services/patientService';
import MedicalRecordList from './MedicalRecordList';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getPatientsByDoctor();
        if (res.success) {
          setPatients(res.data.data || []);
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

    fetchPatients();
  }, []);

  return (
    <div className="patient-list">
      <h2>Danh sách bệnh nhân</h2>

      {loading && <p>Đang tải danh sách bệnh nhân...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {patients.length === 0 ? (
            <p>Chưa có </p>
          ) : (
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Năm sinh</th>
                  <th>Địa chỉ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.fullName}</td>
                    <td>{p.birthYear || '-'}</td>
                    <td>{p.address || '-'}</td>
                    <td>
                      <button onClick={() => setSelectedPatient(p)}>Xem thêm</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {selectedPatient && (
        <MedicalRecordList
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default PatientList;
