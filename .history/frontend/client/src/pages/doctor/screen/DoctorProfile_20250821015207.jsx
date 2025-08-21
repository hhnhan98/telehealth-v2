import React, { useState, useEffect } from 'react';
import DoctorLayout from '../layout/DoctorLayout';
import UserProfile from '../../components/shared/UserProfile';
import userService from '../../../services/userService';

const DoctorProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching doctor profile data...');
        const result = await userService.fetchUserProfile();
        
        if (result.success) {
          console.log('✅ Doctor profile data loaded:', result.data);
          setCurrentUser(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('❌ Error fetching doctor profile:', error);
        setError(error.message || 'Không thể tải thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    console.log('✅ Profile updated successfully:', updatedUser);
    setCurrentUser(updatedUser);
    
    // Có thể thêm toast notification ở đây
    // toast.success('Cập nhật hồ sơ thành công!');
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="profile-loading-container">
          <div className="profile-loading-spinner"></div>
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="profile-error-container">
          <div className="error-icon">⚠️</div>
          <h3>Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            Thử lại
          </button>
        </div>
      </DoctorLayout>
    );
  }

  if (!currentUser) {
    return (
      <DoctorLayout>
        <div className="profile-error-container">
          <div className="error-icon">😞</div>
          <h3>Không có dữ liệu</h3>
          <p>Không thể tải thông tin người dùng</p>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-profile-container">
        <div className="profile-header-section">
          <h1 className="profile-main-title">Hồ Sơ Bác Sĩ</h1>
          <p className="profile-subtitle">Quản lý thông tin cá nhân và chuyên môn</p>
        </div>
        
        <div className="profile-content-wrapper">
          <UserProfile 
            currentUser={currentUser} 
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;