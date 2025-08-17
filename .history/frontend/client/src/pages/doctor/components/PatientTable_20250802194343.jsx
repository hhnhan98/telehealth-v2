import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientTable = ({ data }) => {
  const navigate = useNavigate();

  return (
    <table border="1" cellPadding="10" width="100%">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {data.map((patient) => (
          <tr key={patient._id}>
            <td>{patient.fullName}</td>
            <td>{patient.email}</td>
            <td>{patient.status || 'Đang theo dõi'}</td>
            <td>
              <button onClick={() => navigate(`/doctor/patients/${patient._id}`)}>Xem hồ sơ</button>
              <button onClick={() => navigate(`/doctor/records/create?patientId=${patient._id}`)}>Tạo phiếu khám</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PatientTable;
