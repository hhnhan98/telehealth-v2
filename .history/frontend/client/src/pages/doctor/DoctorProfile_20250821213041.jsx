import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/doctors';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token'); // Hoặc Bearer token từ login

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi fetch profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Không tìm thấy profile</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();
      form.append('fullName', profile.fullName || profile.user.fullName);
      form.append('phone', profile.phone || profile.user.phone);
      form.append('bio', profile.bio || profile.user.bio);
      // Nếu muốn upload avatar:
      // if (profile.avatarFile) form.append('avatar', profile.avatarFile);

      const res = await axios.put(`${API_BASE}/me`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders?.(), // FormData header
        },
      });

      // Cập nhật state ngay, hiển thị profile mới
      setProfile(res.data.data);
      setSaving(false);
      alert('Cập nhật profile thành công!');
    } catch (err) {
      setSaving(false);
      console.error('Lỗi update profile:', err.response?.data || err.message);
      alert('Lỗi khi cập nhật profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, avatarFile: file }));
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Doctor Profile</h2>

      <div>
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={profile.fullName || profile.user.fullName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={profile.phone || profile.user.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Bio:</label>
        <textarea
          name="bio"
          value={profile.bio || profile.user.bio}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Avatar:</label>
        {profile.user.avatar && (
          <div>
            <img src={profile.user.avatar} alt="avatar" width={120} />
          </div>
        )}
        <input type="file" name="avatar" onChange={handleAvatarChange} />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ marginTop: '20px' }}>
        {saving ? 'Đang lưu...' : 'Save'}
      </button>
    </div>
  );
};

export default DoctorProfile;
