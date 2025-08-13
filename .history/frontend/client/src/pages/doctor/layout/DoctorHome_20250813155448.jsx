import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import './DoctorHome.css';

const DoctorHome = () => {
  const [summary, setSummary] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    newMedicalRecords: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy lịch khám hôm nay
        const apptRes = await axios.get('/appointments/today');
        setTodayAppointments(apptRes.data);

        // Lấy tổng bệnh nhân
        const patientRes = await axios.get('/patients/count');
        const totalPatients = patientRes.data?.count || 0;

        // Lấy số hồ sơ bệnh án mới
        const recordRes = await axios.get('/medical-records/new');
        const newRecords = recordRes.data?.count || 0;

        setSummary({
          todayAppointments: apptRes.data.length,
          totalPatients,
          newMedicalRecords: newRecords,
        });
      } catch (err) {
        console.error('Lỗi khi tải dashboard:', err.response || err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="doctor-home">
      <h2>Chào mừng, Bác sĩ</h2>
      {error && <p className="error">{error}</p>}

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
          <p>Đang tải...</p>
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
                <tr key={appt._id}>
                  <td>{new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{appt.patient.fullName}</td>
                  <td
                    className={
                      appt.status === 'pending'
                        ? 'status-pending'
                        : appt.status === 'ongoing'
                        ? 'status-ongoing'
                        : 'status-completed'
                    }
                  >
                    {appt.status === 'pending'
                      ? 'Chưa khám'
                      : appt.status === 'ongoing'
                      ? 'Đang khám'
                      : 'Hoàn thành'}
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
