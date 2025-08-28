import React, { useEffect, useState } from 'react';
import { getPatientsByDoctor } from '../../services/patientService';
import DoctorMedicalRecordList from './DoctorMedicalRecordList';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState({ birthYear: '', address: '' });

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

  // Filter logic
  useEffect(() => {
    let filtered = patients;

    // Quick search: name or phone
    if (quickSearch.trim()) {
      const term = quickSearch.toLowerCase();
      filtered = filtered.filter(p =>
        (p.fullName?.toLowerCase().includes(term)) ||
        (p.phone?.includes(term))
      );
    }

    // Advanced filter
    if (advancedFilterVisible) {
      const { birthYear, address } = advancedFilter;
      filtered = filtered.filter(p => {
        return (
          (birthYear ? String(p.birthYear).includes(birthYear) : true) &&
          (address ? p.address?.toLowerCase().includes(address.toLowerCase()) : true)
        );
      });
    }

    setFilteredPatients(filtered);
  }, [quickSearch, advancedFilter, advancedFilterVisible, patients]);

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="patient-list">
      <h2>Danh sách bệnh nhân</h2>

      {loading && <p>Đang tải danh sách bệnh nhân...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Quick search */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
            <button
              className="btn-advanced"
              onClick={() => setAdvancedFilterVisible(!advancedFilterVisible)}
            >
              {advancedFilterVisible ? 'Ẩn bộ lọc nâng cao' : 'Bộ lọc nâng cao'}
            </button>
          </div>

          {/* Advanced filters */}
          {advancedFilterVisible && (
            <div className="advanced-filters">
              <input
                type="text"
                name="birthYear"
                placeholder="Lọc theo năm sinh"
                value={advancedFilter.birthYear}
                onChange={handleAdvancedFilterChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Lọc theo địa chỉ"
                value={advancedFilter.address}
                onChange={handleAdvancedFilterChange}
              />
            </div>
          )}

          {/* Patient cards */}
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
