import { useState, useEffect } from 'react';
import userService from '../../../services/userService';
import './UserProfile.css';

const UserProfile = ({ currentUser, onProfileUpdate }) => {
  const [user, setUser] = useState(currentUser || {});
  const [formData, setFormData] = useState({
    // Khởi tạo với giá trị mặc định trống
    fullName: '',
    phone: '',
    gender: '',
    birthYear: '',
    address: '',
    specialtyId: '',
    licenseNumber: '',
    experience: '',
    education: '',
    workingHours: '',
    consultationFee: '',
    bio: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    insurance: '',
    password: '',
    confirmPassword: '',
  });
  
  const [specialties, setSpecialties] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load danh sách chuyên khoa (cho bác sĩ)
  useEffect(() => {
    const loadSpecialties = async () => {
      if (user.role === 'doctor') {
        try {
          setSpecialties([
            { _id: '1', name: 'Tim mạch' },
            { _id: '2', name: 'Nhi khoa' },
            { _id: '3', name: 'Da liễu' },
            { _id: '4', name: 'Tai mũi họng' },
            { _id: '5', name: 'Nội khoa' },
          ]);
        } catch (err) {
          console.error('Error loading specialties:', err);
        }
      }
    };
    loadSpecialties();
  }, [user.role]);

  // Cập nhật form khi currentUser thay đổi - SỬA LỖI QUAN TRỌNG
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        // Thông tin chung
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        birthYear: currentUser.birthYear || '',
        address: currentUser.address || '',
        
        // Thông tin bác sĩ
        specialtyId: currentUser.specialtyId || currentUser.specialty?._id || '',
        licenseNumber: currentUser.licenseNumber || '',
        experience: currentUser.experience || '',
        education: currentUser.education || '',
        workingHours: currentUser.workingHours || '',
        consultationFee: currentUser.consultationFee || '',
        bio: currentUser.bio || '',
        
        // Thông tin bệnh nhân
        emergencyContact: currentUser.emergencyContact || '',
        emergencyPhone: currentUser.emergencyPhone || '',
        bloodType: currentUser.bloodType || '',
        allergies: currentUser.allergies || '',
        medicalHistory: currentUser.medicalHistory || '',
        insurance: currentUser.insurance || '',
        
        // Mật khẩu
        password: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Họ và tên không được để trống.');
      return false;
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ (10-11 số).');
      return false;
    }

    if (formData.birthYear && (formData.birthYear < 1900 || formData.birthYear > new Date().getFullYear())) {
      setError('Năm sinh không hợp lệ.');
      return false;
    }

    if (user.role === 'doctor') {
      if (!formData.specialtyId) {
        setError('Vui lòng chọn chuyên khoa.');
        return false;
      }
      if (!formData.licenseNumber.trim()) {
        setError('Số chứng chỉ hành nghề không được để trống.');
        return false;
      }
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setUpdating(true);
    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        gender: formData.gender,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        address: formData.address.trim(),
      };

      if (user.role === 'doctor') {
        updateData.specialtyId = formData.specialtyId;
        updateData.licenseNumber = formData.licenseNumber.trim();
        updateData.experience = formData.experience;
        updateData.education = formData.education.trim();
        updateData.workingHours = formData.workingHours.trim();
        updateData.consultationFee = formData.consultationFee ? parseFloat(formData.consultationFee) : null;
        updateData.bio = formData.bio.trim();
      }

      if (user.role === 'patient') {
        updateData.emergencyContact = formData.emergencyContact.trim();
        updateData.emergencyPhone = formData.emergencyPhone;
        updateData.bloodType = formData.bloodType;
        updateData.allergies = formData.allergies.trim();
        updateData.medicalHistory = formData.medicalHistory.trim();
        updateData.insurance = formData.insurance.trim();
      }

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await userService.updateMyProfile(updateData);
      
      // QUAN TRỌNG: Cập nhật state với dữ liệu mới từ server
      setUser(updatedUser);
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      setSuccess('Cập nhật hồ sơ thành công!');
      
      // Thông báo cho component cha nếu có
      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
      
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Các hàm render giữ nguyên như cũ
  const renderCommonFields = () => (
    <>
      <div className="form-section">
        <h3>Thông tin cá nhân</h3>
        
        <div className="form-group">
          <label>Họ và tên <span className="required">*</span></label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange}
            placeholder="Nhập họ và tên"
            required
            disabled={!isEditing}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số điện thoại</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="0987654321"
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Năm sinh</label>
            <input 
              type="number" 
              name="birthYear" 
              value={formData.birthYear} 
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              placeholder="1990"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange}
            placeholder="Nhập địa chỉ của bạn"
            disabled={!isEditing}
          />
        </div>
      </div>
    </>
  );

  // Các hàm render khác giữ nguyên, chỉ thêm disabled={!isEditing} vào các input

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <h2 className="profile-title">
          Hồ sơ cá nhân 
          {user.role === 'doctor' && <span className="role-badge doctor">Bác sĩ</span>}
          {user.role === 'patient' && <span className="role-badge patient">Bệnh nhân</span>}
        </h2>
        
        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          {user.role === 'doctor' && user.specialty && (
            <p><strong>Chuyên khoa hiện tại:</strong> {user.specialty.name}</p>
          )}
          {user.createdAt && (
            <p><strong>Ngày tham gia:</strong> {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
          )}
        </div>

        <button 
          type="button" 
          onClick={handleEditToggle} 
          className={isEditing ? "btn-cancel" : "btn-edit"}
        >
          {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
        </button>
      </div>

      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        {renderCommonFields()}
        
        {user.role === 'doctor' && renderDoctorFields()}
        {user.role === 'patient' && renderPatientFields()}
        
        {renderPasswordFields()}

        {isEditing && (
          <div className="form-actions">
            <button type="submit" disabled={updating} className="btn-update">
              {updating ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserProfile;