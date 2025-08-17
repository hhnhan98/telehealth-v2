import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientTable.css';

const statusColors = {
  'Đang theo dõi': 'green',
  'Đang chờ khám': 'orange',
  'Hoàn tất': 'gray',
};

const PAGE_SIZE = 5;

const PatientTable = ({ data = [] }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const filtered = data.filter(
      (p) =>
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, data]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const currentData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!data.length) {
    return <p>Chưa có bệnh nhân nào.</p>;
  }

  return (
    <div className="patient-table-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm bệnh nhân..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="patient-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((patient) => {
            const status = patient.status || 'Đang theo dõi';
            const color = statusColors[status] || 'blue';
            return (
              <tr key={patient._id}>
                <td>{patient.fullName}</td>
                <td>{patient.email}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: color }}>
                    {status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/doctor/patients/${patient._id}`)}
                    className="action-btn view-btn"
                  >
                    Xem hồ sơ
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/records/create?patientId=${patient._id}`)}
                    className="action-btn create-btn"
                  >
                    Tạo phiếu khám
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientTable;
