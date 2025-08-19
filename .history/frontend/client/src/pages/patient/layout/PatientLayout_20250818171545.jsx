// src/pages/patient/components/shared/UserProfile.jsx
import { useState, useEffect } from 'react';
import axios from '../../../services/api';
import './UserProfile.css';

const UserProfile = ({ currentUser }) => {
  const [user, setUser] = useState(currentUser || {});
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    gender: user.gender || '',
    birthYear: user.birthYear || '',
    password: '',
    confirmPassword: '',
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Khi currentUser thay đổi (fetch lần đầu), cập nhật form
  useEffect(() => {
    setUser(currentUser || {});
    setFormData({
      fullName: currentUser?.fullName || '',
      phone: currentUser?.phone || '',
      gender: currentUser?.gender || '',
      birthYear: currentUser?.birthYear || '',
      password: '',
      confirmPassword: '',
    });
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Password và Confirm Password không khớp.');
      return;
    }

    setUpdating(true);

    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        birthYear: formData.birthYear,
      };
      if (formData.password) updateData.password = formData.password;

      const res = await axios.put('/users/me', updateData);

      setUser(res.data);
      setFormData({ ...formData, password: '', confirmPassword: '' });
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="user-profile">
      <h2>Hồ sơ cá nhân</h2>
      <div className="profile-header">
        <p>Email: {user.email}</p>
        <p>Chuyên khoa: {user.specialty?.name || 'Chưa có'}</p>
      </div>

      {error && <p className="error">{error}</p>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Họ và tên:
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        </label>

        <label>
          Số điện thoại:
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </label>

        <label>
          Giới tính:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Chọn</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </label>

        <label>
          Năm sinh:
          <input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} />
        </label>

        <label>
          Mật khẩu mới:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Để trống nếu không đổi"
          />
        </label>

        <label>
          Xác nhận mật khẩu:
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
          />
        </label>

        <button type="submit" disabled={updating}>
          {updating ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
