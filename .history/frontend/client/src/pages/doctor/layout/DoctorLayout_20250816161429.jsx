import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './DoctorLayout.css';

const DoctorLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="doctor-layout">
      <aside className="sidebar">
        <h2 className="logo">Telehealth</h2>
        <nav>
          <ul>
            <li><Link to="/doctor">Trang chủ</Link></li>
            <li><Link to="/doctor/schedule">Lịch khám</Link></li>
            <li><Link to="/doctor/patients">Danh sách bệnh nhân</Link></li>
            <li><Link to="/doctor/medical-records">Hồ sơ bệnh án</Link></li>
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="welcome">Xin chào, Bác sĩ</div>
          <div className="header-actions">
            <button onClick={() => navigate('/doctor/profile')}>Hồ sơ</button>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default DoctorLayout;