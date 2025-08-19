// import React, { useEffect, useState } from 'react';
// import axios from '../../../utils/axiosInstance';

// const DoctorDashboard = () => {
//   const [todayAppointments, setTodayAppointments] = useState([]);
//   const [weeklyAppointmentsCount, setWeeklyAppointmentsCount] = useState(0);
//   const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get('/doctor/dashboard');
//         console.log('--- Dashboard API response ---', res.data);

//         // Set dữ liệu từ API
//         const todayAppts = res.data.todayAppointments || [];
//         setTodayAppointments(todayAppts);
//         setTodayAppointmentsCount(todayAppts.length);
//         setWeeklyAppointmentsCount(res.data.weeklyAppointmentsCount || 0);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching dashboard:', err.response || err);
//         setError('Không thể tải dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) return <p>Đang tải dashboard...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="doctor-dashboard">
//       <h2>Dashboard Bác sĩ</h2>

//       {/* --- Card thống kê --- */}
//       <div className="dashboard-cards" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//         <div className="card" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
//           <h4>Bệnh nhân hôm nay</h4>
//           <p>{todayAppointmentsCount}</p>
//         </div>
//         <div className="card" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
//           <h4>Bệnh nhân tuần này</h4>
//           <p>{weeklyAppointmentsCount}</p>
//         </div>
//       </div>

//       {/* --- Bảng lịch hẹn hôm nay --- */}
//       <h3>Lịch hẹn hôm nay</h3>
//       {todayAppointments.length === 0 ? (
//         <p>Chưa có lịch hẹn nào hôm nay</p>
//       ) : (
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr>
//               <th>Giờ khám</th>
//               <th>Bệnh nhân</th>
//               <th>Trạng thái</th>
//               <th>Lí do khám</th>
//             </tr>
//           </thead>
//           <tbody>
//             {todayAppointments.map((appt) => (
//               <tr key={appt._id}>
//                 <td>
//                   {new Date(appt.datetime).toLocaleTimeString('vi-VN', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     timeZone: 'Asia/Ho_Chi_Minh',
//                   })}
//                 </td>
//                 <td>{appt.patient?.fullName || 'Không có thông tin'}</td>
//                 <td>{appt.status || 'Chưa xác nhận'}</td>
//                 <td>{appt.reason || '-'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default DoctorDashboard;
