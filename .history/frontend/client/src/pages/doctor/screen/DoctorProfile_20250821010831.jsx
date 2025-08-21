import React, { useState, useEffect } from 'react';
import DoctorLayout from '../layout/DoctorLayout';
import UserProfile from '../../components/shared/UserProfile';
import userService from '../../../services/userService';

const DoctorProfile = () => {
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
        <div className="doctor-profile-page" style={{padding: '20px', background: 'lightyellow'}}>
        <h1>🚨 ĐÂY LÀ TRANG PROFILE - TEST 🚨</h1>
        <div style={{border: '2px solid red', padding: '15px', margin: '10px 0'}}>
            <h2>Thông tin user:</h2>
            <p>Name: {currentUser?.fullName || 'No data'}</p>
            <p>Email: {currentUser?.email || 'No data'}</p>
            <p>Role: {currentUser?.role || 'No data'}</p>
        </div>
        
        {/* Tạm ẩn UserProfile để test */}
        {/* <UserProfile 
            currentUser={currentUser} 
            onProfileUpdate={handleProfileUpdate}
        /> */}
        </div>
    </DoctorLayout>
    );
};

export default DoctorProfile;