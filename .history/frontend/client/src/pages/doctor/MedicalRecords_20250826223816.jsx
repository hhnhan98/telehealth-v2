import { useEffect, useState } from 'react';
import axios from 'axios';
import PatientCard from './PatientCard';
import PatientHistoryModal from './PatientHistoryModal';

export default function MedicalRecordsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/medical-records?groupByPatient=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(data.data); // data.data là mảng bệnh nhân có thông tin cơ bản
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <p>Đang tải danh sách bệnh nhân...</p>;

  return (
    <div>
      <h2>Quản lý hồ sơ bệnh nhân</h2>
      <div className="patient-list">
        {patients.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            onViewHistory={() => setSelectedPatient(patient)}
          />
        ))}
      </div>

      {selectedPatient && (
        <PatientHistoryModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
