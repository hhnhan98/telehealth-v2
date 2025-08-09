import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient',
    specialty: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Fetch danh sách chuyên khoa từ API
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axiosInstance.get('/specialties');
        setSpecialties(res.data); // [{ _id, name }]
      } catch (err) {
        console.error('Lỗi tải chuyên khoa:', err);
      }
    };
    fetchSpecialties();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'doctor') {
        dataToSend.specialty = formData.specialty; // gửi _id của chuyên khoa
      }

      const res = await axiosInstance.post('/auth/register', dataToSend);
      console.log('Đăng ký thành công:', res.data);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert(error.response?.data?.message || 'Đã có lỗi xảy ra!');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Telehealth</h1>
        <p>Đăng ký tài khoản để bắt đầu</p>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng ký</h2>

          <label>Họ tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

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
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <label>Vai trò</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Bệnh nhân</option>
            <option value="doctor">Bác sĩ</option>
          </select>

          {formData.role === 'doctor' && (
            <>
              <label>Chuyên khoa</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" className="auth-btn">
            Đăng ký
          </button>

          <div className="auth-footer">
            <span onClick={() => navigate('/login')}>
              Đã có tài khoản? Đăng nhập
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
