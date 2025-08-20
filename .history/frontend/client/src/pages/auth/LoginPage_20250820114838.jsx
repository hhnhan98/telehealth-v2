import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import authService from '../../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.login(formData);
      console.log('Login response:', res);

      // Hỗ trợ mọi kiểu backend trả: { user, token } hoặc { data: { user, token } }
      const user = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      if (!user || !token) {
        throw new Error('Không nhận được thông tin đăng nhập');
      }

      // Lưu token localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Điều hướng theo role
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
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Telehealth</h1>
        <p>Hệ thống khám bệnh từ xa</p>
      </div>

      <div className="auth-right">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Đăng nhập</h2>

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

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
}

export default LoginPage;
