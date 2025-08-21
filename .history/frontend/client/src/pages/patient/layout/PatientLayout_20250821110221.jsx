import { useNavigate } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import './PatientLayout.css';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { path: '/patient/dashboard', label: 'Trang chủ', icon: '🏠' },
    { path: '/patient/book-appointment', label: 'Đặt lịch hẹn', icon: '📅' },
    { path: '/patient/appointments', label: 'Lịch sử', icon: '📋' },
    { path: '/patient/profile', label: 'Hồ sơ cá nhân', icon: '👤' },
  ];

  return (
    <div className="patient-layout">
      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Telehealth System</h3>
        </div>
        
        <nav className="sidebar-navigation">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`menu-button ${getActive(item.path) ? 'menu-button-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="button-icon">{item.icon}</span>
              <span className="button-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          className="menu-button logout-button"
          onClick={handleLogout}
        >
          <span className="button-icon">🚪</span>
          <span className="button-label">Đăng xuất</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="patient-main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default PatientLayout;