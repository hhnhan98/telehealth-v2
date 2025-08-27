import React, { useEffect, useState } from 'react';
import { getPatientsByDoctor } from '../../services/patientService';
import MedicalRecordList from './MedicalRecordList';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState({
    name: '',
    birthYear: '',
    address: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getPatientsByDoctor();
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

    fetchPatients();
  }, []);

  // Hàm filter patients theo input
  useEffect(() => {
    const { name, birthYear, address } = searchTerm;
    const filtered = patients.filter(p => {
      return (
        p.fullName.toLowerCase().includes(name.toLowerCase()) &&
        (birthYear ? String(p.birthYear).includes(birthYear) : true) &&
        p.address.toLowerCase().includes(address.toLowerCase())
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
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Tìm kiếm */}
          <div className="search-filters" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Tìm theo họ tên"
              value={searchTerm.name}
              onChange={handleSearchChange}
              style={{ marginRight: '0.5rem' }}
            />
            <input
              type="text"
              name="birthYear"
              placeholder="Tìm theo năm sinh"
              value={searchTerm.birthYear}
              onChange={handleSearchChange}
              style={{ marginRight: '0.5rem' }}
            />
            <input
              type="text"
              name="address"
              placeholder="Tìm theo địa chỉ"
              value={searchTerm.address}
              onChange={handleSearchChange}
            />
          </div>

          {/* Bảng danh sách */}
          {filteredPatients.length === 0 ? (
            <p>Chưa có bệnh nhân</p>
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
                {filteredPatients.map((p) => (
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
