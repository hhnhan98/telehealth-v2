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
          Lịch khám
        </button>
        <button
          style={getActive('/doctor/patients') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/patients')}
        >
          Quản lý bệnh nhân
        </button>
        <button
          style={getActive('/doctor/profile') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/doctor/profile')}
        >
          Hồ sơ cá nhân
        </button>
        <button style={{ ...styles.btn}} onClick={handleLogout}>
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
    backgroundColor: '#F9FAFB',
    fontFamily: 'Inter, sans-serif'
  },
  sidebar: {
    width: '240px',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#111827'
  },
  btn: {
    padding: '10px 14px',
    backgroundColor: '#F3F4F6',
    border: 'none',
    textAlign: 'left',
    fontSize: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#374151'
  },
  btnHover: {
    backgroundColor: '#E5E7EB'
  },
  activeBtn: {
    padding: '10px 14px',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    textAlign: 'left',
    fontSize: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  main: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  }
};
