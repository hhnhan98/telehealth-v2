import React, { useState, useEffect } from 'react';
import UserProfile from '../../components/shared/UserProfile';
import { doctorService } from '../../services';

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    avatar: null,
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Lấy profile khi load trang ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorService.getMyProfile();
        if (res.success) {
          setDoctorData(res.data);
          setFormData({
            fullName: res.data.user.fullName || '',
            phone: res.data.user.phone || '',
            bio: res.data.bio || '',
            avatar: null, // reset file input
          });
          setPreviewAvatar(res.data.user.avatar || '/images/default-avatar.png');
        }
      } catch (err) {
        console.error('Lấy profile thất bại', err);
      }
    };
    fetchProfile();
  }, []);

  // --- Handle thay đổi input ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      setFormData(prev => ({ ...prev, avatar: files[0] }));
      setPreviewAvatar(URL.createObjectURL(files[0])); // preview ngay
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Handle lưu ---
  const handleSave = async () => {
    try {
      setLoading(true);

      const data = new FormData();
      if (formData.fullName?.trim()) data.append('fullName', formData.fullName.trim());
      if (formData.phone?.trim()) data.append('phone', formData.phone.trim());
      if (formData.bio?.trim()) data.append('bio', formData.bio.trim());
      if (formData.avatar instanceof File) data.append('avatar', formData.avatar);

      const res = await doctorService.updateProfile(data);

      if (res.success) {
        setDoctorData(res.data);
        setFormData({
          fullName: res.data.user.fullName || '',
          phone: res.data.user.phone || '',
          bio: res.data.bio || '',
          avatar: null,
        });
        setPreviewAvatar(res.data.user.avatar || '/images/default-avatar.png');
        setEditMode(false);
        alert('Cập nhật profile thành công!');
      } else {
        alert('Cập nhật thất bại: ' + res.message);
      }
    } catch (err) {
      console.error('Lỗi cập nhật profile:', err);
      alert('Lỗi cập nhật profile');
    } finally {
      setLoading(false);
    }
  };

  if (!doctorData) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Hồ Sơ Bác Sĩ</h2>

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={previewAvatar || '/images/default-avatar.png'}
          alt="Avatar bác sĩ"
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
        />
      </div>

      {editMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label>
            Họ tên:
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            />
          </label>
          <label>
            Số điện thoại:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            />
          </label>
          <label>
            Giới thiệu:
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
            />
          </label>
          <label>
            Avatar:
            <input type="file" name="avatar" accept="image/*" onChange={handleChange} />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={handleSave} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button onClick={() => setEditMode(false)}>Hủy</button>
          </div>
        </div>
      ) : (
        <div>
          <UserProfile
            user={{
              fullName: doctorData.user.fullName,
              email: doctorData.user.email,
              specialty: doctorData.specialty?.name,
              location: doctorData.location?.name,
              bio: doctorData.bio,
              phone: doctorData.user.phone,
              avatar: doctorData.user.avatar,
            }}
            role="doctor"
          />
          <button onClick={() => setEditMode(true)} style={{ marginTop: '10px' }}>
            Chỉnh sửa thông tin
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
