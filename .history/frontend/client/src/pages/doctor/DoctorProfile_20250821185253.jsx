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
    avatar: '',
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

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
            avatar: res.data.user.avatar || '',
          });
          setPreviewAvatar(res.data.user.avatar || '/images/default-avatar.png');
        }
      } catch (err) {
        console.error('Lấy profile thất bại', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Tạo FormData để gửi multipart/form-data
      const data = new FormData();

      // Trim và append dữ liệu text nếu có
      if (formData.fullName?.trim()) data.append('fullName', formData.fullName.trim());
      if (formData.phone?.trim()) data.append('phone', formData.phone.trim());
      if (formData.bio?.trim()) data.append('bio', formData.bio.trim());

      // Append file avatar nếu người dùng chọn
      if (formData.avatar) data.append('avatar', formData.avatar);

      // Gọi API
      const res = await doctorService.updateProfile(data);

      if (res.success) {
        setDoctorData(res.data);
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
          src={previewAvatar}
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
