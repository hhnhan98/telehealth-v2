// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import '../../styles/DoctorDashboard.css';

const STATUS_LABELS = {
  pending: 'Chờ xác thực',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã khám'
};

const STATUS_CLASSES = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed'
};

const formatTime = (datetime) =>
  new Date(datetime).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({
    todayAppointments: [],
    weeklyAppointmentsCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    totalSlots: 0,
    bookedSlots: 0,
    freeSlots: 0,
    bookingRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpData, setOtpData] = useState({});
  const navigate = useNavigate();

  const showToast = (message) => alert(message);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorService.fetchDashboard();
      if (res?.success) {
        setDashboard(res.data);
        setError(null);
      } else {
        throw new Error(res?.message || 'Không thể tải dashboard');
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleCancel = async (apptId) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await doctorService.cancelAppointment(apptId);
      showToast('Hủy lịch hẹn thành công');
      loadDashboard();
    } catch (err) {
      console.error(err);
      showToast('Hủy lịch thất bại');
    }
  };

  const handleOtpChange = (id, value) => {
    setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), value } }));
  };

  const handleVerifyOtp = async (id) => {
    const otp = otpData[id]?.value;
    if (!otp) return showToast('Thiếu OTP');
    try {
      const res = await doctorService.verifyOtp(id, otp);
      if (res?.success) {
        showToast('Xác thực OTP thành công');
        loadDashboard();
        setOtpData(prev => ({ ...prev, [id]: { ...prev[id], value: '' } }));
      } else {
        showToast(res?.message || 'Xác thực OTP thất bại');
      }
    } catch (err) {
      console.error(err);
      showToast('OTP không chính xác hoặc hết hạn');
    }
  };

  if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
  if (error) return <div><p>{error}</p><button onClick={loadDashboard}>Thử lại</button></div>;

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Bác sĩ</h2>

      {/* ===== Card thống kê nâng cao ===== */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <h4>Bệnh nhân hôm nay</h4>
          <p>{dashboard.todayAppointments.length}</p>
        </div>
        <div className="stat-card">
          <h4>Bệnh nhân tuần này</h4>
          <p>{dashboard.weeklyAppointmentsCount}</p>
        </div>
        <div className="stat-card">
          <h4>Pending hôm nay</h4>
          <p>{dashboard.pendingCount}</p>
        </div>
        <div className="stat-card">
          <h4>Confirmed hôm nay</h4>
          <p>{dashboard.confirmedCount}</p>
        </div>
        <div className="stat-card">
          <h4>Tổng slot hôm nay</h4>
          <p>{dashboard.totalSlots}</p>
        </div>
        <div className="stat-card">
          <h4>Slot trống</h4>
          <p>{dashboard.freeSlots}</p>
        </div>
        <div className="stat-card">
          <h4>Tỉ lệ đặt</h4>
          <p>{dashboard.bookingRate}%</p>
        </div>
      </div>

      {/* ===== Bảng lịch hẹn hôm nay ===== */}
      <div className="appointments-section">
        <h3>Lịch hẹn hôm nay</h3>
        {dashboard.todayAppointments.length === 0 ? (
          <p>Chưa có lịch hẹn nào hôm nay</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Giờ khám</th>
                <th>Bệnh nhân</th>
                <th>Trạng thái</th>
                <th>Lí do khám</th>
                <th>Hành động nhanh</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.todayAppointments.map(appt => {
                const otpValue = otpData[appt._id]?.value || '';
                return (
                  <tr key={appt._id}>
                    <td>{formatTime(appt.datetime)}</td>
                    <td>{appt.patient?.fullName || '-'}</td>
                    <td>
                      <span className={`status-badge  || ''}`}>
                        {STATUS_LABELS[appt.status] || appt.status || 'pending'}
                      </span>
                    </td>
                    <td>{appt.reason || '-'}</td>
                    <td>
                      {appt.status === 'pending' && (
                        <>
                          <input
                            type="text"
                            placeholder="OTP"
                            value={otpValue}
                            onChange={e => handleOtpChange(appt._id, e.target.value)}
                            className="otp-input"
                          />
                          <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">
                            Xác thực
                          </button>
                        </>
                      )}
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <button onClick={() => handleCancel(appt._id)} className="btn-cancel">
                          Hủy
                        </button>
                      )}
                      <button onClick={() => navigate(`/doctor/appointments/${appt._id}`)} className="btn-detail">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
