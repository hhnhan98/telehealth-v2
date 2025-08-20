// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.login(formData);
      const user = res?.data?.user;
      const token = res?.data?.token;

      if (!user || !token) throw new Error('Không nhận được thông tin đăng nhập');

      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      showToast('Đăng nhập thành công', 'success');

      // Điều hướng theo role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'patient') navigate('/patient');
      else navigate('/');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data || error.message);
      showToast(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Toast */}
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      <div className="auth-left">
        <h1>Telehealth</h1>
        <p>Hệ thống khám bệnh từ xa</p>
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
            placeholder="Nhập email"
            required
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
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