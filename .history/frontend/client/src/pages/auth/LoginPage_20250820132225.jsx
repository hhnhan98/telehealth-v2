import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import authService from '../../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting login with:', formData); // log dữ liệu gửi đi

    try {
      const res = await authService.login(formData);
      console.log('Login API response raw:', res);

      // Nếu backend trả success = false
      if (res?.success === false) {
        console.warn('Backend returned failure:', res.message);
        throw new Error(res?.message || 'Đăng nhập thất bại');
      }

      // Lấy user và token
      const user = res?.data?.user || res?.user;
      const token = res?.data?.token || res?.token;

      console.log('Parsed user:', user);
      console.log('Parsed token:', token);

      if (!user || !token) {
        console.error('Missing user or token in response');
        throw new Error('Không nhận được thông tin đăng nhập');
      }

      // Lưu token và user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Điều hướng theo role
      console.log('Navigating for role:', user.role);
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
      console.error('Lỗi đăng nhập:', error.message, error);
      alert(error.message);
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

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
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
