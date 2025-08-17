import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserMd, FaFileMedical, FaBell } from 'react-icons/fa';
import './DoctorLayout.css';

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

  return (
    <div className="doctor-layout">
      {/* Sidebar dẫn hướng */}
      <aside className="sidebar">
        <h2 className="logo">Telehealth</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/doctor" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaHome className="icon" /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaCalendarAlt className="icon" /> Lịch khám
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaUserMd className="icon" /> Danh sách bệnh nhân
              </NavLink>
            </li>
            <li>
              <NavLink to="/doctor/medical-records" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaFileMedical className="icon" /> Hồ sơ bệnh án
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="header">
          <div className="welcome">Xin chào, {doctorName}</div>
          <div className="header-actions">
            {/* Nút thông báo */}
            <button onClick={() => navigate('/doctor/notifications')} className="btn-notification">
              <FaBell /> Thông báo {newNotifications > 0 && <span className="badge">{newNotifications}</span>}
            </button>

            {/* Nút hồ sơ cá nhân */}
            <button onClick={() => navigate('/doctor/profile')}>Hồ sơ</button>

            {/* Nút đăng xuất */}
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        {/* Khu vực hiển thị màn hình con */}
        <section className="content-area">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default DoctorLayout;
