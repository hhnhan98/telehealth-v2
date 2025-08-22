// PatientProfile.js
import React from 'react';
import UserProfile from '../../components/shared/UserProfile';

const PatientProfile = () => {
  // Giả định bạn đã lấy thông tin bệnh nhân từ API hoặc context
  const patientData = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123456789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    introduction: 'Bệnh nhân có tiền sử bệnh tiểu đường.',
  };

  return (
    <UserProfile user={patientData} role="patient" />
  );
};

export default PatientProfile;
