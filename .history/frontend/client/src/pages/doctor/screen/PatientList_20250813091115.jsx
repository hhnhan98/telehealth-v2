import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import Button from '../../components/ui/button';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách bệnh nhân:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleViewDetail = (id) => {
    navigate(`/doctor/patients/${id}`);
  };

  const handleCreateRecord = (id) => {
    navigate(`/doctor/patients/${id}/create-record`);
  };

  return (
    <div className="patient-list-container">
      <h2 className="patient-list-title">Danh sách bệnh nhân</h2>
      <Card className="patient-list-card">
        <CardContent>
          <div className="table-wrapper">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngày sinh</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{patient.fullName || patient.user?.fullName}</td>
                      <td>
                        {patient.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString()
                          : patient.user?.dateOfBirth
                          ? new Date(patient.user.dateOfBirth).toLocaleDateString()
                          : ''}
                      </td>
                      <td>{patient.phone || ''}</td>
                      <td>{patient.address || ''}</td>
                      <td>
                        <div className="actions">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetail(patient._id)}>
                            Xem hồ sơ
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleCreateRecord(patient._id)}>
                            Tạo phiếu khám
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      Không có bệnh nhân nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
