// // src/pages/patient/layout/PatientLayout.jsx
// import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { fetchUserProfile } from '../../../services/api';
// import UserProfile from '../../components/shared/UserProfile';

// function PatientLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // Lấy thông tin user hiện tại từ API
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         setLoadingUser(true);
//         const res = await fetchUserProfile();
//         setCurrentUser(res.data);
//       } catch (err) {
//         console.error('Lỗi khi tải user:', err);
//       } finally {
//         setLoadingUser(false);
//       }
//     };
//     loadUser();
//   }, []);

//   const getActive = (path) => location.pathname.includes(path);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   // Nếu đang tải thông tin user, hiển thị loading
//   if (loadingUser) {
//     return <div style={{ padding: '30px' }}>Đang tải thông tin người dùng...</div>;
//   }

//   return (
//     <div style={styles.wrapper}>
//       {/* Sidebar */}
//       <aside style={styles.sidebar}>
//         <h3 style={styles.title}>Telehealth System</h3>

//         <button
//           style={getActive('/dashboard') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/patient/dashboard')}
//         >
//           Trang chủ
//         </button>

//         <button
//           style={getActive('/book-appointment') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/patient/book-appointment')}
//         >
//           Đặt lịch hẹn
//         </button>

//         <button
//           style={getActive('/appointments') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/patient/appointments')}
//         >
//           Lịch sử
//         </button>

//         <button
//           style={getActive('/profile') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/patient/profile')}
//         >
//           Hồ sơ cá nhân
//         </button>

//         <button style={{ ...styles.btn, marginTop: 'auto' }} onClick={handleLogout}>
//           Đăng xuất
//         </button>
//       </aside>

//       {/* Main content */}
//       <main style={styles.main}>
//         {/* Nếu path là /patient/profile thì render UserProfile với currentUser */}
//         {location.pathname.includes('/profile') ? (
//           <UserProfile role="patient" currentUser={currentUser} />
//         ) : (
//           <Outlet />
//         )}
//       </main>
//     </div>
//   );
// }

// export default PatientLayout;

// const styles = {
//   wrapper: {
//     display: 'flex',
//     minHeight: '100vh',
//     backgroundColor: '#F9FAFB',
//   },
//   sidebar: {
//     width: '240px',
//     padding: '20px',
//     backgroundColor: '#fff',
//     borderRight: '1px solid #E5E7EB',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px',
//   },
//   title: {
//     fontSize: '18px',
//     fontWeight: '600',
//     marginBottom: '20px',
//   },
//   btn: {
//     padding: '10px',
//     backgroundColor: '#59c2ff5a',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '14px',
//     borderRadius: '6px',
//     cursor: 'pointer',
//   },
//   activeBtn: {
//     padding: '10px',
//     backgroundColor: '#59c2ffff',
//     color: '#fff',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '14px',
//     borderRadius: '6px',
//     cursor: 'pointer',
//   },
//   main: {
//     flex: 1,
//     padding: '30px',
//   },
// };

