import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserMd, FaFileMedical, FaBell } from 'react-icons/fa';

const DoctorLayout = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('Bác sĩ');
  const [newNotifications, setNewNotifications] = useState(0);

  // Lấy tên bác sĩ từ token JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setDoctorName(payload.name || 'Bác sĩ');
      } catch (err) {
        console.error('Token không hợp lệ', err);
      }
    }
  }, []);

  // Demo: lấy số thông báo mới từ API backend
  useEffect(() => {
    // TODO: thay bằng API call thực tế
    setNewNotifications(3);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getActive = (path) => {
    return window.location.pathname.includes(path);
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.title}>Telehealth System</h3>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/doctor"
                style={getActive('/doctor') ? styles.activeBtn : styles.btn}
              >
                <FaHome className="icon" /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/schedule"
                style={getActive('/schedule') ? styles.activeBtn : styles.btn}
              >
                <FaCalendarAlt className="icon" /> Lịch khám
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/patients"
                style={getActive('/patients') ? styles.activeBtn : styles.btn}
              >
                <FaUserMd className="icon" /> Danh sách bệnh nhân
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/medical-records"
                style={getActive('/medical-records') ? styles.activeBtn : styles.btn}
              >
                <FaFileMedical className="icon" /> Hồ sơ bệnh án
              </NavLink>
            </li>
          </ul>
        </nav>
        <button style={{ ...styles.btn, marginTop: 'auto' }} onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.welcome}>Xin chào, {doctorName}</div>
          <div style={styles.headerActions}>
            <button onClick={() => navigate('/doctor/notifications')} style={styles.btnNotification}>
              <FaBell /> Thông báo {newNotifications > 0 && <span style={styles.badge}>{newNotifications}</span>}
            </button>
            <NavLink 
              to="/doctor/profile" 
              style={({ isActive }) => 
                `profile-btn ${isActive ? 'active' : ''}`
              }
            >
              Hồ sơ
            </NavLink>
          </div>
        </header>

        {/* Khu vực hiển thị màn hình con */}
        <section style={styles.contentArea}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DoctorLayout;

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB'
  },
  sidebar: {
    width: '170px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  btn: {
    padding: '10px',
    backgroundColor: '#59c2ff6b',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  activeBtn: {
    padding: '10px',
    backgroundColor: '#59c2ffff',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  main: {
    flex: 1,
    padding: '30px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  welcome: {
    fontSize: '16px',
    fontWeight: '500'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  btnNotification: {
    padding: '10px',
    backgroundColor: '#59c2ff6b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: '50%',
    color: 'white',
    padding: '2px 6px',
    marginLeft: '5px'
  },
  contentArea: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

// import React, { useEffect, useState } from 'react';
// import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// import { FaHome, FaCalendarAlt, FaUserMd, FaFileMedical, FaBell } from 'react-icons/fa';
// //import './DoctorLayout.css';

// const DoctorLayout = () => {
//   const navigate = useNavigate();
//   const [doctorName, setDoctorName] = useState('Bác sĩ');
//   const [newNotifications, setNewNotifications] = useState(0);

//   // Lấy tên bác sĩ từ token JWT
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         setDoctorName(payload.name || 'Bác sĩ');
//       } catch (err) {
//         console.error('Token không hợp lệ', err);
//       }
//     }
//   }, []);

//   // Demo: lấy số thông báo mới từ API backend
//   useEffect(() => {
//     // TODO: thay bằng API call thực tế
//     setNewNotifications(3);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <div className="doctor-layout">
//       {/* Sidebar dẫn hướng */}
//       <aside className="sidebar">
//         <h2 className="logo">Telehealth</h2>
//         <nav>
//           <ul>
//             <li>
//               <NavLink to="/doctor" className={({ isActive }) => isActive ? 'active' : ''}>
//                 <FaHome className="icon" /> Dashboard
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? 'active' : ''}>
//                 <FaCalendarAlt className="icon" /> Lịch khám
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? 'active' : ''}>
//                 <FaUserMd className="icon" /> Danh sách bệnh nhân
//               </NavLink>
//             </li>
//             <li>
//               <NavLink to="/doctor/medical-records" className={({ isActive }) => isActive ? 'active' : ''}>
//                 <FaFileMedical className="icon" /> Hồ sơ bệnh án
//               </NavLink>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Main content */}
//       <div className="main-content">
//         <header className="header">
//           <div className="welcome">Xin chào, {doctorName}</div>
//           <div className="header-actions">
//             {/* Nút thông báo */}
//             <button onClick={() => navigate('/doctor/notifications')} className="btn-notification">
//               <FaBell /> Thông báo {newNotifications > 0 && <span className="badge">{newNotifications}</span>}
//             </button>

//             {/* Nút hồ sơ cá nhân */}
//             <NavLink 
//               to="/doctor/profile" 
//               className={({ isActive }) => 
//                 `profile-btn ${isActive ? 'active' : ''}`
//               }
//             >
//               Hồ sơ
//             </NavLink>         

//             {/* Nút đăng xuất */}
//             <button onClick={handleLogout}>Đăng xuất</button>
//           </div>
//         </header>

//         {/* Khu vực hiển thị màn hình con */}
//         <section className="content-area">
//           <Outlet />
//         </section>
//       </div>
//     </div>
//   );
// };

// export default DoctorLayout;
