// src/pages/doctor/DoctorHome.jsx
import React, { useEffect, useState } from 'react';
import './DoctorHome.css';
import { Link } from 'react-router-dom';

const DoctorHome = () => {
  const [summary, setSummary] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    newMedicalRecords: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mô phỏng gọi API lấy dữ liệu tóm tắt và lịch khám hôm nay
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Mock data tóm tắt
      const mockSummary = {
        todayAppointments: 5,
        totalPatients: 120,
        newMedicalRecords: 3,
      };

      // Mock data lịch khám hôm nay
      const mockAppointments = [
        { id: 1, patientName: 'Nguyễn Văn A', time: '08:30', status: 'Chưa khám' },
        { id: 2, patientName: 'Trần Thị B', time: '09:00', status: 'Đang khám' },
        { id: 3, patientName: 'Lê Văn C', time: '10:00', status: 'Chưa khám' },
        { id: 4, patientName: 'Phạm Thị D', time: '11:00', status: 'Hoàn thành' },
        { id: 5, patientName: 'Võ Văn E', time: '13:30', status: 'Chưa khám' },
      ];

      // Cập nhật state
      setSummary(mockSummary);
      setTodayAppointments(mockAppointments);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="doctor-home">
      <h2>Chào mừng, Bác sĩ</h2>
      <p>Đây là trang chủ quản lý Telehealth</p>

      <div className="summary-cards">
        <div className="card">
          <h3>Lịch khám hôm nay</h3>
          <p>{summary.todayAppointments}</p>
        </div>
        <div className="card">
          <h3>Tổng bệnh nhân</h3>
          <p>{summary.totalPatients}</p>
        </div>
        <div className="card">
          <h3>Hồ sơ bệnh án mới</h3>
          <p>{summary.newMedicalRecords}</p>
          {summary.newMedicalRecords > 0 && (
            <Link to="/doctor/medical-records" className="alert-link">
              Xem ngay
            </Link>
          )}
        </div>
      </div>

      <div className="today-appointments">
        <h3>Lịch khám hôm nay</h3>
        {loading ? (
          <p>Đang tải lịch khám...</p>
        ) : todayAppointments.length === 0 ? (
          <p>Chưa có lịch khám hôm nay.</p>
        ) : (
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Bệnh nhân</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.time}</td>
                  <td>{appt.patientName}</td>
                  <td
                    className={
                      appt.status === 'Chưa khám'
                        ? 'status-pending'
                        : appt.status === 'Đang khám'
                        ? 'status-ongoing'
                        : 'status-completed'
                    }
                  >
                    {appt.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
