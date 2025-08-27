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

// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import './styles/DoctorDashboard1.css';

const HOURS = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30'
];

const DoctorDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [slots, setSlots] = useState([]); // [{time, status, patient}]

  // ===== Mock load slot data =====
  const loadSlots = (day) => {
    // Mock: random booked/free
    const newSlots = HOURS.map(hour => {
      const booked = Math.random() > 0.5;
      return {
        time: hour,
        status: booked ? 'booked' : 'free',
        patient: booked ? { fullName: 'Nguyễn Văn A', reason: 'Khám tổng quát' } : null
      };
    });
    setSlots(newSlots);
    setTotalAppointments(newSlots.filter(s => s.status === 'booked').length);
  };

  useEffect(() => {
    loadSlots(date);
  }, [date]);

  const prevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };

  const handleDateChange = (e) => {
    setDate(new Date(e.target.value));
  };

  const formatDate = (d) =>
    `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  return (
    <div className="doctor-dashboard">
      {/* ===== Card thống kê ===== */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <h4>Tổng lịch hẹn hôm nay</h4>
          <p>{totalAppointments}</p>
        </div>
      </div>

      {/* ===== Navigation ===== */}
      <div className="calendar-nav">
        <button onClick={prevDay} className="nav-btn" title="Hôm qua">◀</button>
        <span className="current-date">{formatDate(date)}</span>
        <button onClick={nextDay} className="nav-btn" title="Ngày mai">▶</button>
        <input
          type="date"
          value={date.toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="date-picker"
        />
      </div>

      {/* ===== Slot Grid 4x4 ===== */}
      <div className="slot-grid">
        {slots.map((slot, idx) => (
          <div
            key={idx}
            className={`slot ${slot.status}`}
            title={slot.status === 'booked' ? `${slot.time} - ${slot.patient.fullName}` : slot.time}
          >
            {slot.time}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;


