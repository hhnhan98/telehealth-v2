import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      const { token, user } = res.data;

      // Lưu token và user info vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Điều hướng theo vai trò lấy từ user.role
      if (user.role === 'doctor') {
        navigate('/doctor');
      } else if (user.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/'); // hoặc trang mặc định khác
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
          <input type="email" name="email" required onChange={handleChange} />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {/* Bỏ chọn role ở đây */}

          <button type="submit" className="auth-btn">Đăng nhập</button>

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
