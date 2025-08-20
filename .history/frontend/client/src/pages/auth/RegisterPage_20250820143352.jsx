// src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import authService from '../../services/authService';
import '../auth/AuthPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient',
    specialty: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [specRes, locRes] = await Promise.all([
          axiosInstance.get('/specialties'),
          axiosInstance.get('/locations'),
        ]);

        if (!mounted) return;

        setSpecialties(Array.isArray(specRes?.data) ? specRes.data : []);
        setLocations(Array.isArray(locRes?.data) ? locRes.data : []);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyên khoa/cơ sở:', err);
        setSpecialties([]);
        setLocations([]);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    fetchOptions();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role' && value === 'patient') {
      setFormData((prev) => ({ ...prev, role: value, specialty: '', location: '' }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return alert('Vui lòng nhập họ tên.');
    if (!validateEmail(formData.email)) return alert('Vui lòng nhập email hợp lệ.');
    if (!formData.password || formData.password.length < 6)
      return alert('Mật khẩu phải có ít nhất 6 ký tự.');
    if (formData.role === 'doctor') {
      if (!formData.location) return alert('Vui lòng chọn cơ sở y tế cho bác sĩ.');
      if (!formData.specialty) return alert('Vui lòng chọn chuyên khoa cho bác sĩ.');
    }

    try {
      setIsSubmitting(true);

      const payload = {
        fullName: String(formData.fullName).trim(),
        email: String(formData.email).trim().toLowerCase(),
        password: String(formData.password),
        role: formData.role,
        ...(formData.role === 'doctor' && {
          specialty: formData.specialty,
          location: formData.location,
        }),
      };

      console.log('[Register] Payload:', payload);

      const registerRes = await authService.register(payload);
      if (!registerRes.success) throw new Error(registerRes.message || 'Đăng ký thất bại');

      console.log('[Register] Success, now logging in...');

      // --- Tự động login ngay sau khi nhấn nút đăng ký
      const loginRes = await authService.login({
        email: payload.email,
        password: payload.password,
      });

      if (!loginRes.success) throw new Error(
        'Đăng ký thành công nhưng đăng nhập thất bại: ' + loginRes.message
      );

      const { token, user } = loginRes;

      // --- Lưu token & user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[Login] Success, navigating for role:', user.role);

      // --- Điều hướng theo role
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'doctor': navigate('/doctor'); break;
        case 'patient': navigate('/patient'); break;
        default: navigate('/'); break;
      }

    } catch (err) {
      console.error('Register/Login error:', err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
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
            placeholder="Nguyễn Văn A"
            className="auth-input"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="auth-input"
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Tối thiểu 6 ký tự"
              className="auth-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((p) => !p)}
              aria-label="Hiển thị mật khẩu"
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <label>Vai trò</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="auth-input"
          >
            <option value="patient">Bệnh nhân</option>
            <option value="doctor">Bác sĩ</option>
          </select>

          {formData.role === 'doctor' && (
            <>
              <label>Cơ sở y tế</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loadingOptions}
                required
                className="auth-input"
              >
                <option value="">-- Chọn cơ sở --</option>
                {locations.map((l) => (
                  <option key={l._id ?? l.id ?? l.name} value={l._id ?? l.id ?? l.name}>
                    {l.name}
                  </option>
                ))}
              </select>

              <label>Chuyên khoa</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                disabled={loadingOptions}
                required
                className="auth-input"
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s._id ?? s.id ?? s.name} value={s._id ?? s.id ?? s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="auth-footer">
            <span onClick={() => navigate('/login')}>Đã có tài khoản? Đăng nhập</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
