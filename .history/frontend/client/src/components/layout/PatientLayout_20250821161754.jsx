// src/components/layout/PatientLayout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/dashboard' },
    { label: 'Đặt lịch hẹn', path: '/book-appointment' },
    { label: 'Lịch sử', path: '/appointments' },
    { label: 'Hồ sơ cá nhân', path: '/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-surface border-r border-gray-200 p-5 gap-2
                    ${sidebarOpen ? 'w-48' : 'w-0 overflow-hidden'} transition-[width] duration-300 relative`}
      >
        <h3 className="text-lg font-semibold mb-5 text-text">Telehealth System</h3>

        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`text-left px-4 py-2 rounded-md text-sm transition-colors duration-200
                        ${getActive(item.path)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-primary-light hover:bg-primary hover:text-white'}`}
            onClick={() => navigate(`/patient${item.path}`)}
          >
            {item.label}
          </button>
        ))}

        <button
          className="mt-auto px-4 py-2 rounded-md text-sm bg-red-400 hover:bg-red-500 text-white transition-colors duration-200"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>

        {/* Toggle Sidebar for Mobile */}
        <button
          className="absolute top-5 right-5 sm:hidden text-text hover:text-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✖' : '☰'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;

// import { useNavigate } from 'react-router-dom';
// import { Outlet, useLocation } from 'react-router-dom';

// function PatientLayout() {
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
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default PatientLayout;

// const styles = {
//   wrapper: {
//     display: 'flex',
//     minHeight: '100vh',
//     backgroundColor: '#F9FAFB'
//   },
//   sidebar: {
//     width: '170px',
//     padding: '20px',
//     backgroundColor: '#fff',
//     borderRight: '1px solid #E5E7EB',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px'
//   },
//   title: {
//     fontSize: '18px',
//     fontWeight: '600',
//     marginBottom: '20px'
//   },
//   btn: {
//     padding: '10px',
//     backgroundColor: '#59c2ff6b',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '14px',
//     borderRadius: '6px',
//     cursor: 'pointer'
//   },
//   activeBtn: {
//     padding: '10px',
//     backgroundColor: '#59c2ffff',
//     color: '#fff',
//     border: 'none',
//     textAlign: 'left',
//     fontSize: '14px',
//     borderRadius: '6px',
//     cursor: 'pointer'
//   },
//   main: {
//     flex: 1,
//     padding: '30px'
//   }
// };
