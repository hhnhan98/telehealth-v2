import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosInstance';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import '../style/PatientDetail.css';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchPatientDetail = async () => {
      try {
        const response = await axios.get(`/patients/${patientId}`);
        setPatient(response.data.patient);
        setRecords(response.data.records || []);
      } catch (error) {
        console.error('Lỗi khi tải thông tin bệnh nhân:', error);
      }
    };

    fetchPatientDetail();
  }, [patientId]);

  const handleCreateRecord = () => {
    navigate(`/doctor/records/create/${patientId}`);
  };

  if (!patient) {
    return <div>Đang tải dữ liệu bệnh nhân...</div>;
  }

  return (
    <div className="patient-detail-container">
      <h2 className="section-title">Thông tin bệnh nhân</h2>

      <Card className="patient-card">
        <CardContent>
          <p><strong>Họ tên:</strong> {patient.fullName}</p>
          <p><strong>Năm sinh:</strong> {patient.yearOfBirth}</p>
          <p><strong>Giới tính:</strong> {patient.gender}</p>
          <p><strong>Số điện thoại:</strong> {patient.phone || 'Chưa có'}</p>
        </CardContent>
      </Card>

      <div className="record-header">
        <h3 className="section-title">Hồ sơ bệnh án</h3>
        <Button onClick={handleCreateRecord}>+ Tạo hồ sơ mới</Button>
      </div>

      {records.length === 0 ? (
        <p className="no-records">Bệnh nhân chưa có hồ sơ nào.</p>
      ) : (
        <div className="record-list">
          {records.map((record) => (
            <Card key={record._id} className="record-card">
              <CardContent>
                <p><strong>Ngày khám:</strong> {new Date(record.date).toLocaleDateString()}</p>
                <p><strong>Triệu chứng:</strong> {record.symptoms}</p>
                <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDetail;