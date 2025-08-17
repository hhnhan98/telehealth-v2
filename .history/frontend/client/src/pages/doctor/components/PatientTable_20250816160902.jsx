import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientTable.css'; // bạn có thể tuỳ chỉnh style riêng

const statusColors = {
  'Đang theo dõi': 'green',
  'Đang chờ khám': 'orange',
  'Hoàn tất': 'gray',
};

const PatientTable = ({ data = [] }) => {
  const navigate = useNavigate();

  if (!data.length) {
    return <p>Chưa có bệnh nhân nào.</p>;
  }

  return (
    <div className="patient-table-container">
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
          {data.map((patient) => {
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
    </div>
  );
};

export default PatientTable;
