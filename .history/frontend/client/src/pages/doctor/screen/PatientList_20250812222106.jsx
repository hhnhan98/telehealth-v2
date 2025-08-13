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

  const handleViewDetail = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  const handleCreateRecord = (patientId) => {
    navigate(`/doctor/patients/${patientId}/create-record`);
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
                  <th>Năm sinh</th>
                  <th>Triệu chứng</th>
                  <th>Chẩn đoán</th>
                  <th>Lần khám gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{patient.fullName}</td>
                      <td>{patient.birthYear}</td>
                      <td>{patient.symptoms}</td>
                      <td>{patient.diagnosis || 'Chưa có'}</td>
                      <td>{patient.lastVisit || 'Chưa có'}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(patient._id)}
                          >
                            Xem hồ sơ
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCreateRecord(patient._id)}
                          >
                            Tạo phiếu khám
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
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
