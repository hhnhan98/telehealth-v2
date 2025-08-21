import React, { useState, useEffect } from 'react';
import PatientLayout from '../layout/PatientLayout';
import UserProfile from '../../components/shared/';
import userService from '../../../../services/userService';

const PatientProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await userService.fetchUserProfile();
        if (result.success) {
          setCurrentUser(result.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Có thể thêm toast notification ở đây
    console.log('Profile updated successfully:', updatedUser);
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-profile-page">
        <div className="page-header">
          <h1>Hồ Sơ Bệnh Nhân</h1>
          <p>Quản lý thông tin cá nhân và sức khỏe</p>
        </div>
        <UserProfile 
          currentUser={currentUser} 
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    </PatientLayout>
  );
};

export default PatientProfile;