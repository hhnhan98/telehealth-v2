import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Card, CardContent, Button} from '../../components/ui/Card';
// import '../style/DoctorAppointmentDetail.css'; // dùng chung CSS

const DoctorAppointmentDetail = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      try {
        const response = await axios.get(`/appointments/${appointmentId}`);
        setAppointment(response.data.appointment);
        setPatient(response.data.appointment.patient);
        setRecords(response.data.appointment.records || []);
      } catch (error) {
        console.error('Lỗi khi tải thông tin appointment:', error);
      }
    };

    fetchAppointmentDetail();
  }, [appointmentId]);

  const handleCreateRecord = () => {
    if (patient) navigate(`/doctor/records/create/${patient._id}`);
  };

  if (!appointment || !patient) {
    return <div>Đang tải dữ liệu lịch hẹn...</div>;
  }

  return (
    <div className="patient-detail-container">
      <h2 className="section-title">Chi tiết lịch hẹn</h2>

      <Card className="patient-card">
        <CardContent>
          <p><strong>Giờ khám:</strong> {new Date(appointment.datetime).toLocaleString()}</p>
          <p><strong>Trạng thái:</strong> {appointment.status}</p>
          <p><strong>Lí do khám:</strong> {appointment.reason || '-'}</p>
        </CardContent>
      </Card>

      <h3 className="section-title">Thông tin bệnh nhân</h3>
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

export default DoctorAppointmentDetail;
