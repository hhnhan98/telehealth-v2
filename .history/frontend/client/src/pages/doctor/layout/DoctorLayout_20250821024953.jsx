import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserMd, FaFileMedical, FaBell } from 'react-icons/fa';
import './DoctorLayout.css'; // Import file CSS

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
    <div className="wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="title">Telehealth System</h3>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/doctor"
                className={getActive('/doctor') ? 'activeBtn' : 'btn'}
              >
                <FaHome className="icon" /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/schedule"
                className={getActive('/schedule') ? 'activeBtn' : 'btn'}
              >
                <FaCalendarAlt className="icon" /> Lịch khám
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/patients"
                className={getActive('/patients') ? 'activeBtn' : 'btn'}
              >
                <FaUserMd className="icon" /> Danh sách bệnh nhân
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/doctor/medical-records"
                className={getActive('/medical-records') ? 'activeBtn' : 'btn'}
              >
                <FaFileMedical className="icon" /> Hồ sơ bệnh án
              </NavLink>
            </li>
          </ul>
        </nav>
        <button className="btn" style={{ marginTop: 'auto' }} onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="main">
        <header className="header">
          <div className="welcome">Xin chào, {doctorName}</div>
          <div className="headerActions">
            <button 
              onClick={() => navigate('/doctor/notifications')} 
              className="btnNotification"
            >
              <FaBell /> Thông báo {newNotifications > 0 && <span className="badge">{newNotifications}</span>}
            </button>
            <NavLink 
              to="/doctor/profile" 
              className={({ isActive }) => 
                `profile-btn ${isActive ? 'active' : ''}`
              }
            >
              Hồ sơ
            </NavLink>
          </div>
        </header>

        {/* Khu vực hiển thị màn hình con */}
        <section className="contentArea">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DoctorLayout;
