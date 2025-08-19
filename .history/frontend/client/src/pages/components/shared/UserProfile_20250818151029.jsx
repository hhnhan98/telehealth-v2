// src/pages/components/shared/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../../services/api';
import './UserProfile.css';

const UserProfile = ({ currentUser, role }) => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    specialty: '',
    clinic: '',
    experience: ''
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (currentUser) {
      setUserData(prev => ({
        ...prev,
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        dob: currentUser.dob ? currentUser.dob.split('T')[0] : '',
        specialty: currentUser.specialty || '',
        clinic: currentUser.clinic || '',
        experience: currentUser.experience || ''
      }));
    }
  }, [currentUser]);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(currentUser._id, userData);
      showToast('Cập nhật thông tin thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Cập nhật thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>Hồ sơ {role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Họ và tên</label>
          <input type="text" name="fullName" value={userData.fullName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={userData.email} onChange={handleChange} disabled />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="text" name="phone" value={userData.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Giới tính</label>
          <select name="gender" value={userData.gender} onChange={handleChange}>
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ngày sinh</label>
          <input type="date" name="dob" value={userData.dob} onChange={handleChange} />
        </div>

        {role === 'doctor' && (
          <>
            <div className="form-group">
              <label>Chuyên khoa</label>
              <input type="text" name="specialty" value={userData.specialty} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phòng khám</label>
              <input type="text" name="clinic" value={userData.clinic} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Kinh nghiệm (năm)</label>
              <input type="number" name="experience" value={userData.experience} onChange={handleChange} />
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
