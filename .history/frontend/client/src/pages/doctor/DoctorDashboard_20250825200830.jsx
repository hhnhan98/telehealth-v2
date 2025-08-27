// // src/pages/doctor/screen/DoctorDashboard.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import doctorService from '../../services/doctorService';
// import './styles/DoctorDashboard.css';

// const STATUS_LABELS = {
//   pending: 'Chờ xác thực',
//   confirmed: 'Đã xác nhận',
//   cancelled: 'Đã hủy',
//   completed: 'Đã khám'
// };

// const STATUS_CLASSES = {
//   pending: 'status-pending',
//   confirmed: 'status-confirmed',
//   cancelled: 'status-cancelled',
//   completed: 'status-completed'
// };

// const formatTime = (datetime) =>
//   datetime
//     ? new Date(datetime).toLocaleTimeString('vi-VN', {
//         hour: '2-digit',
//         minute: '2-digit',
//         timeZone: 'Asia/Ho_Chi_Minh'
//       })
//     : '-';

// const DoctorDashboard = () => {
//   const [dashboard, setDashboard] = useState({
//     todayAppointments: [],
//     weeklyAppointmentsCount: 0,
//     pendingCount: 0,
//     confirmedCount: 0,
//     totalSlots: 0,
//     bookedSlots: 0,
//     freeSlots: 0,
//     bookingRate: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const showToast = (message) => alert(message);

//   // ===== Load dashboard từ backend =====
//   const loadDashboard = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await doctorService.fetchDashboard();
//       if (res?.success && res.data) {
//         setDashboard({
//           todayAppointments: Array.isArray(res.data.todayAppointments)
//             ? res.data.todayAppointments
//             : [],
//           weeklyAppointmentsCount: res.data.weeklyAppointmentsCount || 0,
//           pendingCount: res.data.pendingCount || 0,
//           confirmedCount: res.data.confirmedCount || 0,
//           totalSlots: res.data.totalSlots || 0,
//           bookedSlots: res.data.bookedSlots || 0,
//           freeSlots: res.data.freeSlots || 0,
//           bookingRate: res.data.bookingRate || 0
//         });
//         setError(null);
//       } else {
//         throw new Error(res?.message || 'Không thể tải dashboard');
//       }
//     } catch (err) {
//       console.error('❌ Error loading dashboard:', err);
//       setError(err.message || 'Lỗi tải dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadDashboard();
//   }, [loadDashboard]);

//   // ===== Hủy appointment =====
//   const handleCancel = async (apptId) => {
//     if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
//     try {
//       await doctorService.cancelAppointment(apptId);
//       showToast('Hủy lịch hẹn thành công');
//       loadDashboard();
//     } catch (err) {
//       console.error('❌ Cancel appointment error:', err);
//       showToast('Hủy lịch thất bại');
//     }
//   };

//   // ===== Đánh dấu hoàn tất khám =====
//   const handleComplete = async (apptId) => {
//     try {
//       await doctorService.completeAppointment(apptId);
//       showToast('Đánh dấu đã khám');
//       loadDashboard();
//     } catch (err) {
//       console.error('❌ Complete appointment error:', err);
//       showToast('Không thể đánh dấu hoàn tất');
//     }
//   };

//   if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
//   if (error)
//     return (
//       <div>
//         <p>{error}</p>
//         <button onClick={loadDashboard}>Thử lại</button>
//       </div>
//     );

//   const {
//     todayAppointments,
//     weeklyAppointmentsCount,
//     pendingCount,
//     confirmedCount,
//     totalSlots,
//     freeSlots,
//     bookingRate
//   } = dashboard;

//   return (
//     <div className="doctor-dashboard">
//       <h2>Dashboard Bác sĩ</h2>

//       {/* ===== Card thống kê ===== */}
//       <div className="dashboard-cards">
//         <div className="stat-card">
//           <h4>Bệnh nhân hôm nay</h4>
//           <p>{todayAppointments.length || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Bệnh nhân tuần này</h4>
//           <p>{weeklyAppointmentsCount || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Pending hôm nay</h4>
//           <p>{pendingCount || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Confirmed hôm nay</h4>
//           <p>{confirmedCount || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Tổng slot hôm nay</h4>
//           <p>{totalSlots || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Slot trống</h4>
//           <p>{freeSlots || 0}</p>
//         </div>
//         <div className="stat-card">
//           <h4>Tỉ lệ đặt</h4>
//           <p>{bookingRate || 0}%</p>
//         </div>
//       </div>

//       {/* ===== Bảng lịch hẹn hôm nay ===== */}
//       <div className="appointments-section">
//         <h3>Lịch hẹn hôm nay</h3>
//         {todayAppointments.length === 0 ? (
//           <p>Chưa có lịch hẹn nào hôm nay</p>
//         ) : (
//           <table className="appointments-table">
//             <thead>
//               <tr>
//                 <th>Giờ khám</th>
//                 <th>Bệnh nhân</th>
//                 <th>Trạng thái</th>
//                 <th>Lí do khám</th>
//                 <th>Hành động nhanh</th>
//               </tr>
//             </thead>
//             <tbody>
//               {todayAppointments.map((appt) => (
//                 <tr key={appt._id}>
//                   <td>{formatTime(appt.datetime)}</td>
//                   <td>{appt.patient?.fullName || '-'}</td>
//                   <td>
//                     <span
//                       className={`status-badge ${
//                         STATUS_CLASSES[appt.status] || ''
//                       }`}
//                     >
//                       {STATUS_LABELS[appt.status] || appt.status || '-'}
//                     </span>
//                   </td>
//                   <td>{appt.reason || '-'}</td>
//                   <td className="actions">
//                     {(appt.status === 'pending' || appt.status === 'confirmed') && (
//                       <button
//                         onClick={() => handleCancel(appt._id)}
//                         className="btn-cancel"
//                       >
//                         Hủy
//                       </button>
//                     )}
//                     {appt.status === 'confirmed' && (
//                       <button
//                         onClick={() => handleComplete(appt._id)}
//                         className="btn-complete"
//                       >
//                         Hoàn tất khám
//                       </button>
//                     )}
//                     <button
//                       onClick={() => navigate(`/doctor/appointments/${appt._id}`)}
//                       className="btn-detail"
//                     >
//                       Xem chi tiết
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;

// src/pages/doctor/screen/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './styles/DoctorDashboard.css';

// const STATUS_LABELS = {
//   pending: 'Chờ xác thực',
//   confirmed: 'Đã xác nhận',
//   cancelled: 'Đã hủy',
//   completed: 'Đã khám'
// };

const STATUS_CLASSES = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  cancelled: 'status-cancelled',
  completed: 'status-completed'
};

const formatTime = (datetime) =>
  datetime
    ? new Date(datetime).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
      })
    : '-';

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({
    todayAppointments: [],
    weeklyAppointmentsCount: 0,
    totalSlots: 0,
    bookedSlots: 0,
    freeSlots: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => alert(msg);

  // Load dashboard
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorService.fetchDashboard();
      if (res?.success && res.data) {
        setDashboard({
          todayAppointments: Array.isArray(res.data.todayAppointments)
            ? res.data.todayAppointments
            : [],
          weeklyAppointmentsCount: res.data.weeklyAppointmentsCount || 0,
          totalSlots: res.data.totalSlots || 0,
          bookedSlots: res.data.bookedSlots || 0,
          freeSlots: res.data.freeSlots || 0
        });
        setError(null);
      } else {
        throw new Error(res?.message || 'Không thể tải dashboard');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Lỗi tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await doctorService.cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công');
      loadDashboard();
    } catch {
      showToast('Hủy lịch thất bại');
    }
  };

  // Complete appointment
  const handleComplete = async (id) => {
    try {
      await doctorService.completeAppointment(id);
      showToast('Đánh dấu đã khám');
      loadDashboard();
    } catch {
      showToast('Không thể đánh dấu hoàn tất');
    }
  };

  if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
  if (error)
    return (
      <div>
        <p>{error}</p>
        <button onClick={loadDashboard}>Thử lại</button>
      </div>
    );

  const { todayAppointments, weeklyAppointmentsCount, totalSlots, freeSlots } = dashboard;

  // Tạo mảng slots để hiển thị dạng lưới
  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const appt = todayAppointments.find((a) => a.slotIndex === i);
    return appt || null;
  });

  return (
    <div className="doctor-dashboard">
      <h2>Dashboard Bác sĩ</h2>

      {/* Card thống kê */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <h4>Bệnh nhân hôm nay</h4>
          <p>{todayAppointments.length}</p>
        </div>
        <div className="stat-card">
          <h4>Bệnh nhân tuần này</h4>
          <p>{weeklyAppointmentsCount}</p>
        </div>
      </div>

      {/* Lưới slot hôm nay */}
      <div className="slot-grid-section">
        <h3>Slot khám hôm nay</h3>
        {totalSlots === 0 ? (
          <p>Chưa có slot hôm nay</p>
        ) : (
          <div className="slot-grid">
            {slots.map((appt, idx) => {
              const status = appt ? appt.status : 'free';
              const label = appt ? appt.patient?.fullName : 'Trống';
              const colorClass = appt ? STATUS_CLASSES[status] : 'status-free';
              return (
                <div
                  key={idx}
                  className={`slot ${colorClass}`}
                  title={appt ? `${label} - ${appt.reason || '-'}` : 'Trống'}
                  onClick={() => appt && navigate(`/doctor/appointments/${appt._id}`)}
                >
                  {appt ? formatTime(appt.datetime) : `Slot ${idx + 1}`}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
