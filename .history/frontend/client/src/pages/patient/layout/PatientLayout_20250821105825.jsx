import { useNavigate, Outlet, useLocation } from 'react-router-dom';

function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const getActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    alert('Bạn đã đăng xuất thành công!');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.title}>Telehealth System</h3>
        {user && <p style={styles.userGreeting}>Xin chào, {user.name}</p>}
        <nav style={styles.nav}>
          <button style={getActive('/dashboard') ? styles.activeBtn : styles.btn} onClick={() => navigate('/patient/dashboard')}>
            🏠 Trang chủ
          </button>
          <button style={getActive('/book-appointment') ? styles.activeBtn : styles.btn} onClick={() => navigate('/patient/book-appointment')}>
            📅 Đặt lịch hẹn
          </button>
          <button style={getActive('/appointments') ? styles.activeBtn : styles.btn} onClick={() => navigate('/patient/appointments')}>
            📜 Lịch sử
          </button>
          <button style={getActive('/patient/profile') ? styles.activeBtn : styles.btn} onClick={() => navigate('/patient/profile')}>
            👤 Hồ sơ cá nhân
          </button>
        </nav>
        <button style={{ ...styles.btn, marginTop: 'auto' }} onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
  },
  sidebar: {
    width: '200px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  userGreeting: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#333',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  btn: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  activeBtn: {
    backgroundColor: '#45a049',
  },
  main: {
    flex: 1,
    padding: '30px',
    backgroundColor: '#F1F1F1',
  },
};

// Các component khác như PatientDashboard, AppointmentList, AppointmentForm có thể được thiết kế tương tự.
