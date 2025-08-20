import { useNavigate } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';

function PatientLayout() {
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
          style={getActive('/dashboard') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/patient/dashboard')}
        >
          Trang chủ
        </button>
        <button
          style={getActive('/book-appointment') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/patient/book-appointment')}
        >
          Đặt lịch hẹn
        </button>
        <button
          style={getActive('/appointments') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/patient/appointments')}
        >
          Lịch sử
        </button>
        <button
          style={getActive('/profile') ? styles.activeBtn : styles.btn}
          onClick={() => navigate('/patient/profile')}
        >
          Hồ sơ cá nhân
        </button>
        <button style={{ ...styles.btn, marginTop: 'auto' }} onClick={handleLogout}>
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

export default PatientLayout;

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB'
  },
  sidebar: {
    width: '240px',
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
    backgroundColor: '#F3F4F6',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  activeBtn: {
    padding: '10px',
    backgroundColor: '#59c2ffff',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    padding: '30px'
  }
};
