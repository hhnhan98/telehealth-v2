// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import authService from '../../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Validate email format
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // --- Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- Trim & lowercase email, trim password
    const email = String(formData.email || '').trim().toLowerCase();
    const password = String(formData.password || '').trim();

    if (!email || !password) {
      alert('Vui lòng nhập email và mật khẩu.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      alert('Email không hợp lệ.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.login({ email, password });

      if (!res?.success) throw new Error(res.message || 'Đăng nhập thất bại');

      const { user } = res;

      if (!user) throw new Error('Không nhận được thông tin người dùng.');

      // --- Điều hướng theo role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'patient':
          navigate('/patient');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Telehealth System</h1>
        <p>Hệ thống Đặt Lịch & Theo Dõi Khám Bệnh Từ Xa</p>
      </div>

      <div className="auth-right">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Đăng nhập</h2>

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Hiển thị mật khẩu"
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="auth-footer">
            Chưa có tài khoản?{' '}
            <span onClick={() => navigate('/register')}>Đăng ký ngay</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
