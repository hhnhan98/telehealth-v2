import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    birthYear: '',
    password: '',
    confirmPassword: '',
  });

  // --- Fetch user ---
  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        gender: res.data.gender || '',
        birthYear: res.data.birthYear || '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Lỗi khi tải user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // --- Handle form input ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Handle update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Password và Confirm Password không khớp.');
      setUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        birthYear: formData.birthYear,
      };
      if (formData.password) updateData.password = formData.password;

      const res = await axios.put('/users/me', updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      alert('Cập nhật hồ sơ thành công!');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      console.error('Lỗi khi cập nhật user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Đang tải hồ sơ...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-profile">
      <h2>Hồ sơ cá nhân</h2>
      <div className="profile-header">
        <p>Email: {user.email}</p>
        <p>Chuyên khoa: {user.specialty?.name || 'Chưa có'}</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Họ và tên:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </label>

        <label>
          Số điện thoại:
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
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
          <input
            type="number"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleChange}
          />
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
