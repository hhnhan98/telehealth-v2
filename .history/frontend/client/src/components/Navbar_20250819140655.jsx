import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(!user);

  // Fetch profile nếu chưa có dữ liệu user
  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const profile = await userService.fetchUserProfile();
          setUser(profile);
        } catch (err) {
          console.error('Lỗi khi fetch user:', err);
          handleLogout(); // token hết hạn hoặc lỗi → logout
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [user]);

  const handleLogout = () => {
    authService.logoutLocalOnly(); // chỉ xoá token + user
    navigate('/login');             // dùng navigate chuyển route
  };

  if (loading) return <div className="navbar">Đang tải...</div>;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">Telehealth</Link>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user">
              {user.fullName} ({user.role})
            </span>

            {user.role === 'patient' && (
              <>
                <Link to="/patient/dashboard">Dashboard</Link>
                <Link to="/patient/appointments">Lịch hẹn</Link>
                <Link to="/patient/profile">Hồ sơ</Link>
              </>
            )}

            {user.role === 'doctor' && (
              <>
                <Link to="/doctor/dashboard">Dashboard</Link>
                <Link to="/doctor/schedule">Lịch làm việc</Link>
                <Link to="/doctor/profile">Hồ sơ</Link>
              </>
            )}

            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
