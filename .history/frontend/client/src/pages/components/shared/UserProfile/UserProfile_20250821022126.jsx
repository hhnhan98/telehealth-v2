import React from 'react';

const UserProfile = ({ user, role }) => {
  return (
    <div style={styles.wrapper}>
      <h2>Hồ Sơ {role === 'doctor' ? 'Bác Sĩ' : 'Bệnh Nhân'}</h2>
      <div style={styles.info}>
        <p><strong>Email:</strong> {user.email}</p>
        
        {role === 'doctor' && (
          <>
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Chuyên Khoa:</strong> {user.specialty}</p>
            <p><strong>Cơ Sở Y Tế:</strong> {user.hospital}</p>
            <p><strong>Giới Thiệu:</strong> {user.introduction}</p>
          </>
        )}
        
        {role === 'patient' && (
          <>
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Số Điện Thoại:</strong> {user.phone}</p>
            <p><strong>Địa Chỉ:</strong> {user.address}</p>
            <p><strong>Giới Thiệu:</strong> {user.introduction}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

const styles = {
  wrapper: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  info: {
    marginTop: '10px',
    fontSize: '16px',
  },
};
