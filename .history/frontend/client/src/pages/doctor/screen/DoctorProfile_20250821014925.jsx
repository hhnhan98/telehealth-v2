import React, { useState, useEffect } from 'react';
import DoctorLayout from '../layout/DoctorLayout';
import UserProfile from '../../components/shared/UserProfile';
import userService from '../../../services/userService';

const DoctorProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Có thể thêm toast notification ở đây
    console.log('Profile updated successfully:', updatedUser);
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-profile-page">
        <div className="page-header">
          <h1>Hồ Sơ Bác Sĩ</h1>
          <p>Quản lý thông tin cá nhân và chuyên môn</p>
        </div>
        <UserProfile 
          currentUser={currentUser} 
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;