// import { useState, useEffect } from 'react';
// import userService from '../../../services/userService';
// import './UserProfile.css';

// const UserProfile = ({ currentUser }) => {
//   const [user, setUser] = useState(currentUser || {});
//   const [formData, setFormData] = useState({
//     // Thông tin chung
//     fullName: user.fullName || '',
//     phone: user.phone || '',
//     gender: user.gender || '',
//     birthYear: user.birthYear || '',
//     address: user.address || '',
    
//     // Thông tin bác sĩ
//     specialtyId: user.specialtyId || '',
//     licenseNumber: user.licenseNumber || '',
//     experience: user.experience || '',
//     education: user.education || '',
//     workingHours: user.workingHours || '',
//     consultationFee: user.consultationFee || '',
//     bio: user.bio || '',
    
//     // Thông tin bệnh nhân
//     emergencyContact: user.emergencyContact || '',
//     emergencyPhone: user.emergencyPhone || '',
//     bloodType: user.bloodType || '',
//     allergies: user.allergies || '',
//     medicalHistory: user.medicalHistory || '',
//     insurance: user.insurance || '',
    
//     // Mật khẩu
//     password: '',
//     confirmPassword: '',
//   });
  
//   const [specialties, setSpecialties] = useState([]);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   // Load danh sách chuyên khoa (cho bác sĩ)
//   useEffect(() => {
//     const loadSpecialties = async () => {
//       if (user.role === 'doctor') {
//         try {
//           setSpecialties([
//             { _id: '1', name: 'Tim mạch' },
//             { _id: '2', name: 'Nhi khoa' },
//             { _id: '3', name: 'Da liễu' },
//             { _id: '4', name: 'Tai mũi họng' },
//             { _id: '5', name: 'Nội khoa' },
//           ]);
//         } catch (err) {
//           console.error('Error loading specialties:', err);
//         }
//       }
//     };
//     loadSpecialties();
//   }, [user.role]);

//   // Cập nhật form khi currentUser thay đổi
//   useEffect(() => {
//     setUser(currentUser || {});
//     setFormData({
//       // Thông tin chung
//       fullName: currentUser?.fullName || '',
//       phone: currentUser?.phone || '',
//       gender: currentUser?.gender || '',
//       birthYear: currentUser?.birthYear || '',
//       address: currentUser?.address || '',
      
//       // Thông tin bác sĩ
//       specialtyId: currentUser?.specialtyId || currentUser?.specialty?._id || '',
//       licenseNumber: currentUser?.licenseNumber || '',
//       experience: currentUser?.experience || '',
//       education: currentUser?.education || '',
//       workingHours: currentUser?.workingHours || '',
//       consultationFee: currentUser?.consultationFee || '',
//       bio: currentUser?.bio || '',
      
//       // Thông tin bệnh nhân
//       emergencyContact: currentUser?.emergencyContact || '',
//       emergencyPhone: currentUser?.emergencyPhone || '',
//       bloodType: currentUser?.bloodType || '',
//       allergies: currentUser?.allergies || '',
//       medicalHistory: currentUser?.medicalHistory || '',
//       insurance: currentUser?.insurance || '',
      
//       // Mật khẩu
//       password: '',
//       confirmPassword: '',
//     });
//   }, [currentUser]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     // Clear messages when user starts typing
//     setError(null);
//     setSuccess(null);
//   };

//   const validateForm = () => {
//     // Validation cho thông tin chung
//     if (!formData.fullName.trim()) {
//       setError('Họ và tên không được để trống.');
//       return false;
//     }

//     if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
//       setError('Số điện thoại không hợp lệ (10-11 số).');
//       return false;
//     }

//     if (formData.birthYear && (formData.birthYear < 1900 || formData.birthYear > new Date().getFullYear())) {
//       setError('Năm sinh không hợp lệ.');
//       return false;
//     }

//     // Validation cho bác sĩ
//     if (user.role === 'doctor') {
//       if (!formData.specialtyId) {
//         setError('Vui lòng chọn chuyên khoa.');
//         return false;
//       }
//       if (!formData.licenseNumber.trim()) {
//         setError('Số chứng chỉ hành nghề không được để trống.');
//         return false;
//       }
//     }

//     // Validation mật khẩu
//     if (formData.password && formData.password !== formData.confirmPassword) {
//       setError('Mật khẩu và xác nhận mật khẩu không khớp.');
//       return false;
//     }

//     if (formData.password && formData.password.length < 6) {
//       setError('Mật khẩu phải có ít nhất 6 ký tự.');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!validateForm()) return;

//     setUpdating(true);
//     try {
//       // Chuẩn bị dữ liệu update theo role
//       const updateData = {
//         fullName: formData.fullName.trim(),
//         phone: formData.phone,
//         gender: formData.gender,
//         birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
//         address: formData.address.trim(),
//       };

//       // Thêm dữ liệu cho bác sĩ
//       if (user.role === 'doctor') {
//         updateData.specialtyId = formData.specialtyId;
//         updateData.licenseNumber = formData.licenseNumber.trim();
//         updateData.experience = formData.experience;
//         updateData.education = formData.education.trim();
//         updateData.workingHours = formData.workingHours.trim();
//         updateData.consultationFee = formData.consultationFee ? parseFloat(formData.consultationFee) : null;
//         updateData.bio = formData.bio.trim();
//       }

//       // Thêm dữ liệu cho bệnh nhân
//       if (user.role === 'patient') {
//         updateData.emergencyContact = formData.emergencyContact.trim();
//         updateData.emergencyPhone = formData.emergencyPhone;
//         updateData.bloodType = formData.bloodType;
//         updateData.allergies = formData.allergies.trim();
//         updateData.medicalHistory = formData.medicalHistory.trim();
//         updateData.insurance = formData.insurance.trim();
//       }

//       // Thêm mật khẩu nếu có
//       if (formData.password) {
//         updateData.password = formData.password;
//       }

//       const updatedUser = await userService.updateMyProfile(updateData);
//       setUser(updatedUser);
//       setFormData({ ...formData, password: '', confirmPassword: '' });
//       setSuccess('Cập nhật hồ sơ thành công!');
//     } catch (err) {
//       setError(err.message || 'Cập nhật thất bại.');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const renderCommonFields = () => (
//     <>
//       <div className="form-section">
//         <h3>Thông tin cá nhân</h3>
        
//         <div className="form-group">
//           <label>Họ và tên <span className="required">*</span></label>
//           <input 
//             type="text" 
//             name="fullName" 
//             value={formData.fullName} 
//             onChange={handleChange}
//             placeholder="Nhập họ và tên"
//             required
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Số điện thoại</label>
//             <input 
//               type="tel" 
//               name="phone" 
//               value={formData.phone} 
//               onChange={handleChange}
//               placeholder="0987654321"
//             />
//           </div>

//           <div className="form-group">
//             <label>Giới tính</label>
//             <select name="gender" value={formData.gender} onChange={handleChange}>
//               <option value="">Chọn giới tính</option>
//               <option value="male">Nam</option>
//               <option value="female">Nữ</option>
//               <option value="other">Khác</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Năm sinh</label>
//             <input 
//               type="number" 
//               name="birthYear" 
//               value={formData.birthYear} 
//               onChange={handleChange}
//               min="1900"
//               max={new Date().getFullYear()}
//               placeholder="1990"
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label>Địa chỉ</label>
//           <input 
//             type="text" 
//             name="address" 
//             value={formData.address} 
//             onChange={handleChange}
//             placeholder="Nhập địa chỉ của bạn"
//           />
//         </div>
//       </div>
//     </>
//   );

//   const renderDoctorFields = () => (
//     <div className="form-section">
//       <h3>Thông tin bác sĩ</h3>
      
//       <div className="form-group">
//         <label>Chuyên khoa <span className="required">*</span></label>
//         <select name="specialtyId" value={formData.specialtyId} onChange={handleChange} required>
//           <option value="">Chọn chuyên khoa</option>
//           {specialties.map(specialty => (
//             <option key={specialty._id} value={specialty._id}>
//               {specialty.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>Số chứng chỉ hành nghề <span className="required">*</span></label>
//           <input 
//             type="text" 
//             name="licenseNumber" 
//             value={formData.licenseNumber} 
//             onChange={handleChange}
//             placeholder="Nhập số chứng chỉ"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Kinh nghiệm (năm)</label>
//           <input 
//             type="number" 
//             name="experience" 
//             value={formData.experience} 
//             onChange={handleChange}
//             min="0"
//             placeholder="5"
//           />
//         </div>
//       </div>

//       <div className="form-group">
//         <label>Trình độ học vấn</label>
//         <input 
//           type="text" 
//           name="education" 
//           value={formData.education} 
//           onChange={handleChange}
//           placeholder="Tiến sĩ Y khoa, Đại học Y Hà Nội"
//         />
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label>Giờ làm việc</label>
//           <input 
//             type="text" 
//             name="workingHours" 
//             value={formData.workingHours} 
//             onChange={handleChange}
//             placeholder="8:00 - 17:00 (Thứ 2 - Thứ 6)"
//           />
//         </div>

//         <div className="form-group">
//           <label>Phí khám (VNĐ)</label>
//           <input 
//             type="number" 
//             name="consultationFee" 
//             value={formData.consultationFee} 
//             onChange={handleChange}
//             min="0"
//             placeholder="300000"
//           />
//         </div>
//       </div>

//       <div className="form-group">
//         <label>Giới thiệu bản thân</label>
//         <textarea 
//           name="bio" 
//           value={formData.bio} 
//           onChange={handleChange}
//           rows="4"
//           placeholder="Mô tả về kinh nghiệm, chuyên môn và phong cách khám chữa bệnh của bạn..."
//         />
//       </div>
//     </div>
//   );

//   const renderPatientFields = () => (
//     <div className="form-section">
//       <h3>Thông tin y tế</h3>
      
//       <div className="form-row">
//         <div className="form-group">
//           <label>Liên hệ khẩn cấp</label>
//           <input 
//             type="text" 
//             name="emergencyContact" 
//             value={formData.emergencyContact} 
//             onChange={handleChange}
//             placeholder="Tên người thân"
//           />
//         </div>

//         <div className="form-group">
//           <label>SĐT khẩn cấp</label>
//           <input 
//             type="tel" 
//             name="emergencyPhone" 
//             value={formData.emergencyPhone} 
//             onChange={handleChange}
//             placeholder="0987654321"
//           />
//         </div>

//         <div className="form-group">
//           <label>Nhóm máu</label>
//           <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
//             <option value="">Chọn nhóm máu</option>
//             <option value="A+">A+</option>
//             <option value="A-">A-</option>
//             <option value="B+">B+</option>
//             <option value="B-">B-</option>
//             <option value="AB+">AB+</option>
//             <option value="AB-">AB-</option>
//             <option value="O+">O+</option>
//             <option value="O-">O-</option>
//           </select>
//         </div>
//       </div>

//       <div className="form-group">
//         <label>Dị ứng (nếu có)</label>
//         <input 
//           type="text" 
//           name="allergies" 
//           value={formData.allergies} 
//           onChange={handleChange}
//           placeholder="Penicillin, hải sản, phấn hoa..."
//         />
//       </div>

//       <div className="form-group">
//         <label>Tiền sử bệnh</label>
//         <textarea 
//           name="medicalHistory" 
//           value={formData.medicalHistory} 
//           onChange={handleChange}
//           rows="3"
//           placeholder="Các bệnh đã từng mắc, phẫu thuật, thuốc đang sử dụng..."
//         />
//       </div>

//       <div className="form-group">
//         <label>Bảo hiểm y tế</label>
//         <input 
//           type="text" 
//           name="insurance" 
//           value={formData.insurance} 
//           onChange={handleChange}
//           placeholder="Số thẻ BHYT hoặc bảo hiểm tư nhân"
//         />
//       </div>
//     </div>
//   );

//   const renderPasswordFields = () => (
//     <div className="form-section">
//       <h3>Thay đổi mật khẩu</h3>
      
//       <div className="form-row">
//         <div className="form-group">
//           <label>Mật khẩu mới</label>
//           <input 
//             type="password" 
//             name="password" 
//             value={formData.password} 
//             onChange={handleChange} 
//             placeholder="Để trống nếu không đổi"
//             minLength="6"
//           />
//         </div>

//         <div className="form-group">
//           <label>Xác nhận mật khẩu</label>
//           <input 
//             type="password" 
//             name="confirmPassword" 
//             value={formData.confirmPassword} 
//             onChange={handleChange} 
//             placeholder="Nhập lại mật khẩu mới"
//           />
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="user-profile-card">
//       <div className="profile-header">
//         <h2 className="profile-title">
//           Hồ sơ cá nhân 
//           {user.role === 'doctor' && <span className="role-badge doctor">Bác sĩ</span>}
//           {user.role === 'patient' && <span className="role-badge patient">Bệnh nhân</span>}
//         </h2>
        
//         <div className="profile-info">
//           <p><strong>Email:</strong> {user.email}</p>
//           {user.role === 'doctor' && user.specialty && (
//             <p><strong>Chuyên khoa hiện tại:</strong> {user.specialty.name}</p>
//           )}
//           {user.createdAt && (
//             <p><strong>Ngày tham gia:</strong> {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
//           )}
//         </div>
//       </div>

//       {error && <div className="profile-error">{error}</div>}
//       {success && <div className="profile-success">{success}</div>}

//       <form className="profile-form" onSubmit={handleSubmit}>
//         {renderCommonFields()}
        
//         {user.role === 'doctor' && renderDoctorFields()}
//         {user.role === 'patient' && renderPatientFields()}
        
//         {renderPasswordFields()}

//         <div className="form-actions">
//           <button type="submit" disabled={updating} className="btn-update">
//             {updating ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;