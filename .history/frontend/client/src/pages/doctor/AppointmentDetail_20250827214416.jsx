// ===== THÔNG TIN CHI TIẾT LỊCH HẸN =====
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/DoctorAppointmentDetail.css';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Bạn chưa đăng nhập');

        const { data } = await axios.get(`/api/doctors/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!data?.success || !data.data) {
          throw new Error(data?.message || 'Không tìm thấy cuộc hẹn');
        }

        setAppointment(data.data);
      } catch (err) {
        console.error('Lỗi khi tải thông tin appointment:', err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  if (loading) return <p className="loading-message">Đang tải thông tin cuộc hẹn...</p>;
  if (error) return (
    <div className="error-message">
      <p>{error}</p>
      <button className="btn-primary" onClick={() => navigate(-1)}>Quay lại</button>
    </div>
  );
  if (!appointment) return null;

// ===== Patient =====
const patientUser = appointment.patient?.user ?? null;
const patientName = patientUser.user.fullName || appointment.patient?.fullName || 'Không rõ';
const patientEmail = patientUser?.email || 'Không rõ';
const patientPhone = patientUser?.phone || 'Không rõ';
const patientAvatar = patientUser?.avatar || '/default-avatar.png';

// ===== Doctor =====
const doctorUser = appointment.doctor?.user ?? null;
const doctorName = doctorUser?.fullName || appointment.doctor?.fullName || 'Không rõ';

  const statusColors = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    completed: 'status-completed',
  };

  return (
    <div className="appointment-pro-container">
      <div className='cards-row'>  
        {/* Thông tin lịch hẹn */}
        <div className="appointment-card">
          <h2>Chi tiết cuộc hẹn</h2>
          <div className="appointment-info">
            <p><strong>Bác sĩ:</strong> {doctorName}</p>
            <p><strong>Ngày/giờ:</strong> {appointment.date} {appointment.time}</p>
            <p><strong>Chuyên khoa:</strong> {appointment.specialty?.name || 'N/A'}</p>
            <p><strong>Cơ sở y tế:</strong> {appointment.location?.name || 'N/A'}</p>
            <p><strong>Lý do:</strong> {appointment.reason || 'Không có'}</p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <span className={`appointment-status ${statusColors[appointment.status]}`}>
                {appointment.status}
              </span>
            </p>
          </div>
        </div>

        {/* Thông tin bệnh nhân */}
        <div className="patient-card">
          <h2>Thông tin bệnh nhân</h2>
          <div className="patient-avatar">
            <img src={patientAvatar} alt="Avatar bệnh nhân" />
          </div>
          <div className="patient-details">
            <p><strong>Tên:</strong> {patientName}</p>
            <p><strong>Email:</strong> {patientEmail}</p>
            <p><strong>Điện thoại:</strong> {patientPhone}</p>
          </div>
        </div>

      </div>
      
      {/* Phiếu khám */}
      {appointment.medicalReceipt && (
        <div className="appointment-card medical-receipt">
          <h3>Phiếu khám</h3>
          <pre>{JSON.stringify(appointment.medicalReceipt, null, 2)}</pre>
        </div>
      )}

      {/* Nút tạo phiếu khám */}
      {appointment.status !== 'completed' && (
        <button
          className="btn-primary btn-create"
          onClick={() => navigate(`/doctor/appointments/${id}/medical-receipt`)}
        >
          Tạo phiếu khám
        </button>
      )}
    </div>
  );
}