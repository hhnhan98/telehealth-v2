import React, { useEffect, useState } from 'react';
import { getPatientsByDoctor } from '../../../services/patientService';
import MedicalRecordList from './MedicalRecordList';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await getPatientsByDoctor(); // API backend: lấy bệnh nhân do bác sĩ phụ trách
      if (res.success) setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Danh sách bệnh nhân</h2>
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
