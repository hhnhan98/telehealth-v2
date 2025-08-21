import React, { useState, useEffect } from 'react';
import PatientLayout from '../layout/PatientLayout';
import UserProfile from '../../components/shared/UserProfile/UserProfile';
import userService from '../../../../services/userService';
import './PatientProfile.css';

const PatientProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await userService.fetchUserProfile();
        
        if (result.success) {
          setCurrentUser(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching patient profile:', error);
        setError(error.message || 'Không thể tải thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    console.log('Profile updated successfully:', updatedUser);
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="profile-error">
          <h3>Đã xảy ra lỗi</h3>
          <p>{error}</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-profile-page">
        <div className="profile-header">
          <h1>Hồ Sơ Bệnh Nhân</h1>
          <p>Quản lý thông tin cá nhân và sức khỏe</p>
        </div>
        
        <UserProfile 
          currentUser={currentUser}
          onProfileUpdate={handleProfileUpdate}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
    </PatientLayout>
  );
};

export default PatientProfile;