import { useState, useEffect } from 'react';
import userService from '../../../services/userService';
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

  // Cập nhật form khi currentUser thay đổi
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
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
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

      const updatedUser = await userService.updateMyProfile(updateData);
      setUser(updatedUser);
      setFormData({ ...formData, password: '', confirmPassword: '' });
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="user-profile-card">
      <h2 className="profile-title">Hồ sơ cá nhân</h2>

      <div className="profile-info">
        <p><strong>Email:</strong> {user.email}</p>
        {user.role === 'doctor' && (
          <p><strong>Chuyên khoa:</strong> {user.specialty?.name || 'Chưa có'}</p>
        )}
      </div>

      {error && <div className="profile-error">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và tên:</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Số điện thoại:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Giới tính:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Chọn</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Năm sinh:</label>
          <input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Mật khẩu mới:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Để trống nếu không đổi" />
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu:</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" />
        </div>

        <button type="submit" disabled={updating} className="btn-update">
          {updating ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;

// import './UserProfile.css';

// const UserProfile = ({ currentUser }) => {
//   const [user, setUser] = useState(currentUser || {});
//   const [formData, setFormData] = useState({
//     fullName: user.fullName || '',
//     phone: user.phone || '',
//     gender: user.gender || '',
//     birthYear: user.birthYear || '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState(null);

//   // Cập nhật form khi currentUser thay đổi
//   useEffect(() => {
//     setUser(currentUser || {});
//     setFormData({
//       fullName: currentUser?.fullName || '',
//       phone: currentUser?.phone || '',
//       gender: currentUser?.gender || '',
//       birthYear: currentUser?.birthYear || '',
//       password: '',
//       confirmPassword: '',
//     });
