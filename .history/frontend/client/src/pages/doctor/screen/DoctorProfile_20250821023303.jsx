// DoctorProfile.js
import React from 'react';
import UserProfile from '../..//UserProfile';

const DoctorProfile = () => {
  // Giả định bạn đã lấy thông tin bác sĩ từ API hoặc context
  const doctorData = {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    specialty: 'Nội khoa',
    hospital: 'Bệnh viện Đa khoa TP.HCM',
    introduction: 'Bác sĩ có 10 năm kinh nghiệm trong lĩnh vực nội khoa.',
  };

  return (
    <UserProfile user={doctorData} role="doctor" />
  );
};

export default DoctorProfile;
