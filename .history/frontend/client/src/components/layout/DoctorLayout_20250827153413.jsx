import { useNavigate } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';

function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.title}>Telehealth System</h3>
        <button
          style={getActive('/doctor/dashboard') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/dashboard')}
        >
          Trang chủ
        </button>
        <button
          style={getActive('/doctor/schedule') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/schedule')}
        >
          Lịch làm việc
        </button>
        <button
          style={getActive('/doctor/patients') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/patients')}
        >
          Quản lý hồ sơ
        </button>
        <button
          style={getActive('/doctor/profile') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/profile')}
        >
          Hồ sơ cá nhân
        </button>
        <button style={styles.btn} onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default DoctorLayout;

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB'
  },
  sidebar: {
    width: '220px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#111827'
  },
  btn: {
    padding: '12px 16px',
    backgroundColor: '#59c2ff6b',
    color: '#111827',
    border: 'none',
    textAlign: 'left',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  activeBtn: {
    padding: '12px 16px',
    backgroundColor: '#59c2ffff',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: '30px'
  }
};

// import { useNavigate } from 'react-router-dom';
// import { Outlet, useLocation } from 'react-router-dom';

// function DoctorLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const getActive = (path) => location.pathname.includes(path);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <div style={styles.wrapper}>
//       {/* Sidebar */}
//       <aside style={styles.sidebar}>
//         <h3 style={styles.title}>Telehealth System</h3>
//         <button
//           style={getActive('/doctor/dashboard') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/doctor/dashboard')}
//         >
//           Trang chủ
//         </button>
//         <button
//           style={getActive('/doctor/schedule') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/doctor/schedule')}
//         >
//           Lịch khám
//         </button>
//         <button
//           style={getActive('/doctor/patients') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/doctor/medical-records')}
//         >
//           Quản lý hồ sơ bệnh án
//         </button>
//         <button
//           style={getActive('/doctor/profile') ? styles.activeBtn : styles.btn}
//           onClick={() => navigate('/doctor/profile')}
//         >
//           Hồ sơ cá nhân
//         </button>
//         <button style={{ ...styles.btn }} onClick={handleLogout}>
//           Đăng xuất
//         </button>
//       </aside>

//       {/* Main content */}
//       <main style={styles.main}>
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default DoctorLayout;

// const styles = {
//   wrapper: {
//     display: 'flex',
//     minHeight: '100vh',
//     backgroundColor: '#F9FAFB'
//   },
//   sidebar: {
//     width: '220px',
//     padding: '15px',
//     backgroundColor: '#fff',
//     borderRight: '1px solid #E5E7EB',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px'
//   },
//   title: {
//     fontSize: '20px',
//     fontWeight: '600',
//     marginBottom: '20px',
//     color: '#111827'
//   },
//   btn: {
//     padding: '12px 16px',
//     backgroundColor: '#59c2ff6b',
//     color: '#111827',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '16px',
//     borderRadius: '6px',
//     cursor: 'pointer'
//   },
//   activeBtn: {
//     padding: '12px 16px',
//     backgroundColor: '#59c2ffff',
//     color: '#fff',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '16px',
//     borderRadius: '6px',
//     cursor: 'pointer'
//   },
//   main: {
//     flex: 1,
//     padding: '30px'
//   }
// };