

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';

// const API_BASE = 'http://localhost:5000/api/doctors';

// const DoctorProfile = () => {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

//   const token = localStorage.getItem('token');

//   // ----------------- Lấy profile -----------------
//   const fetchProfile = useCallback(async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setProfile(res.data.data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Lỗi fetch profile:', err);
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchProfile();
//   }, [fetchProfile]);

//   if (loading) return <p>Loading profile...</p>;
//   if (!profile) return <p>Không tìm thấy profile</p>;

//   // ----------------- Handle input change -----------------
//   const handleChange = (e) => {
//     let { name, value } = e.target;
//     if (name === 'birthYear') {
//       value = value === '' ? '' : Number(value); // rỗng hoặc number
//     }
//     setProfile(prev => ({ ...prev, [name]: value }));
//   };

//   // ----------------- Handle avatar change -----------------
//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) setProfile((prev) => ({ ...prev, avatarFile: file }));
//   };

//   // ----------------- Handle save -----------------
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       // --- Tạo FormData để gửi lên server ---
//       const form = new FormData();
//       form.append('fullName', profile.fullName || profile.user.fullName);
//       form.append('phone', profile.phone || profile.user.phone);
//       form.append('bio', profile.bio || profile.user.bio);
//       const birthYearToSend = profile.birthYear ?? profile.user.birthYear ?? '';
//       form.append('birthYear', birthYearToSend);
//       if (profile.avatarFile) form.append('avatar', profile.avatarFile);

//       // --- Gửi PUT request ---
//       const { data } = await axios.put(`${API_BASE}/me`, form, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // --- Cập nhật state profile, đảm bảo user.birthYear được hiển thị ---
//       setProfile(prev => ({
//         ...prev,
//         ...data.data,           // cập nhật các field ngoài user
//         user: {
//           ...prev.user,
//           ...data.data.user,    // cập nhật user subdocument
//         },
//       }));

//       setSaving(false);
//       alert('Cập nhật profile thành công!');
//     } catch (err) {
//       setSaving(false);
//       console.error('Lỗi update profile:', err.response?.data || err.message);
//       alert('Lỗi khi cập nhật profile');
//     }
//   };

//   // ----------------- Handle password change -----------------
//   const handlePasswordChange = async () => {
//     if (passwords.new !== passwords.confirm) return alert('Mật khẩu mới và xác nhận không trùng nhau!');
//     try {
//       await axios.put(
//         `${API_BASE}/me/password`,
//         { current: passwords.current, newPassword: passwords.new },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       alert('Đổi mật khẩu thành công!');
//       setPasswords({ current: '', new: '', confirm: '' });
//     } catch (err) {
//       console.error('Lỗi đổi mật khẩu:', err.response?.data || err.message);
//       alert('Lỗi khi đổi mật khẩu');
//     }
//   };

//   return (
//     <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Thông tin bác sĩ</h2>

//       {/* Avatar */}
//       <div style={{ textAlign: 'center', marginBottom: '20px' }}>
//         {profile.avatarFile ? (
//           <img src={URL.createObjectURL(profile.avatarFile)} alt="avatar preview" width={120} style={{ borderRadius: '50%' }} />
//         ) : profile.user.avatar ? (
//           <img src={profile.user.avatar} alt="avatar" width={120} style={{ borderRadius: '50%' }} />
//         ) : (
//           <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#eee', display: 'inline-block' }} />
//         )}
//         <div style={{ marginTop: '10px' }}>
//           <input type="file" name="avatar" onChange={handleAvatarChange} />
//         </div>
//       </div>

//       {/* Form thông tin */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//         <div>
//           <label>Họ và tên</label>
//           <input type="text" name="fullName" value={profile.fullName || profile.user.fullName} onChange={handleChange} />
//         </div>
//         <div>
//           <label>Email</label>
//           <input type="email" value={profile.user.email} disabled />
//         </div>
//         <div>
//           <label>SĐT</label>
//           <input type="text" name="phone" value={profile.phone || profile.user.phone} onChange={handleChange} />
//         </div>
//         <div>
//           <label>Năm sinh</label>
//           <input
//             type="number"
//             name="birthYear"
//             value={profile.birthYear ?? profile.user.birthYear ?? ''}
//             onChange={handleChange}
//           />
//         </div>
//         <div style={{ gridColumn: '1 / 3' }}>
//           <label>Chuyên khoa</label>
//           <input type="text" value={profile.specialty?.name || ''} disabled />
//         </div>
//         <div style={{ gridColumn: '1 / 3' }}>
//           <label>Cơ sở y tế</label>
//           <input type="text" value={profile.location?.name || ''} disabled />
//         </div>
//         <div style={{ gridColumn: '1 / 3' }}>
//           <label>Bio</label>
//           <textarea name="bio" value={profile.bio || profile.user.bio || ''} onChange={handleChange} rows={3} />
//         </div>
//       </div>

//       <button
//         onClick={handleSave}
//         disabled={saving}
//         style={{ marginTop: '20px', padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//       >
//         {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
//       </button>

//       {/* Form đổi password */}
//       <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
//         <h3>Đổi mật khẩu</h3>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//           <div>
//             <label>Mật khẩu hiện tại</label>
//             <input type="password" value={passwords.current} onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))} />
//           </div>
//           <div>
//             <label>Mật khẩu mới</label>
//             <input type="password" value={passwords.new} onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))} />
//           </div>
//           <div>
//             <label>Xác nhận mật khẩu mới</label>
//             <input type="password" value={passwords.confirm} onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))} />
//           </div>
//         </div>
//         <button
//           onClick={handlePasswordChange}
//           style={{ marginTop: '15px', padding: '8px 15px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//         >
//           Đổi mật khẩu
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DoctorProfile;