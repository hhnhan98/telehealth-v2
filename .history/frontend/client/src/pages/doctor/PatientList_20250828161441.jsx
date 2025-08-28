import React, { useEffect, useState } from 'react';
import { getPatientsByDoctor } from '../../services/patientService';
import DoctorMedicalRecordList from './DoctorMedicalRecordList';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState({ name: '', birthYear: '', address: '' });

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPatientsByDoctor({ headers: { 'Cache-Control': 'no-cache' } });
      if (res.success) {
        setPatients(res.data);
        setFilteredPatients(res.data);
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

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const { name, birthYear, address } = searchTerm;
    const filtered = patients.filter(p => {
      const pName = p.fullName ? p.fullName.toLowerCase() : '';
      const pAddress = p.address ? p.address.toLowerCase() : '';
      return (
        pName.includes(name.toLowerCase()) &&
        (birthYear ? String(p.birthYear).includes(birthYear) : true) &&
        pAddress.includes(address.toLowerCase())
      );
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchTerm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="patient-list">
      <h2>Danh sách bệnh nhân</h2>

      {loading && <p>Đang tải danh sách bệnh nhân...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="search-filters">
            <input
              type="text"
              name="name"
              placeholder="Tìm theo họ tên"
              value={searchTerm.name}
              onChange={handleSearchChange}
            />
            <input
              type="text"
              name="birthYear"
              placeholder="Tìm theo năm sinh"
              value={searchTerm.birthYear}
              onChange={handleSearchChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Tìm theo địa chỉ"
              value={searchTerm.address}
              onChange={handleSearchChange}
            />
          </div>

          {filteredPatients.length === 0 ? (
            <p>Chưa có bệnh nhân</p>
          ) : (
            <div className="patient-grid">
              {filteredPatients.map(p => (
                <div
                  key={p._id}
                  className={`patient-card ${selectedPatient?._id === p._id ? 'selected' : ''}`}
                  onClick={() => setSelectedPatient(p)}
                >
                  <div className="patient-info">
                    <p className="patient-name">{p.fullName}</p>
                    <p><strong>Năm sinh:</strong> {p.birthYear || '-'}</p>
                    <p><strong>Địa chỉ:</strong> {p.address || '-'}</p>
                    <p><strong>Điện thoại:</strong> {p.phone || '-'}</p>
                  </div>
                  <button className="btn-view">Xem hồ sơ</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedPatient && (
        <DoctorMedicalRecordList
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onRecordSaved={(newRecord) => {
            console.log('Record mới đã được lưu:', newRecord);
            fetchPatients();
          }}
        />
      )}
    </div>
  );
};

export default PatientList;
