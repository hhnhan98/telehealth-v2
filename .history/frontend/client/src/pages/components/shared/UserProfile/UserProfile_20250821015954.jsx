import React, { useState, useEffect } from 'react';
import UserProfileCommon from './UserProfileCommon';
import DoctorProfileSection from './DoctorProfileSection';
import PatientProfileSection from './PatientProfileSection';
import './UserProfile.css';

const UserProfile = ({ currentUser, onProfileUpdate, isEditing, setIsEditing }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Khởi tạo form data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        birthYear: currentUser.birthYear || '',
        address: currentUser.address || '',
        specialtyId: currentUser.specialtyId || currentUser.specialty?._id || '',
        licenseNumber: currentUser.licenseNumber || '',
        experience: currentUser.experience || '',
        education: currentUser.education || '',
        workingHours: currentUser.workingHours || '',
        consultationFee: currentUser.consultationFee || '',
        bio: currentUser.bio || '',
        emergencyContact: currentUser.emergencyContact || '',
        emergencyPhone: currentUser.emergencyPhone || '',
        bloodType: currentUser.bloodType || '',
        allergies: currentUser.allergies || '',
        medicalHistory: currentUser.medicalHistory || '',
        insurance: currentUser.insurance || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validation logic here
      const updateData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone,
        gender: formData.gender,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : null,
        address: formData.address.trim(),
      };

      if (currentUser.role === 'doctor') {
        updateData.specialtyId = formData.specialtyId;
        updateData.licenseNumber = formData.licenseNumber.trim();
        updateData.experience = formData.experience;
        updateData.education = formData.education.trim();
        updateData.workingHours = formData.workingHours.trim();
        updateData.consultationFee = formData.consultationFee ? parseFloat(formData.consultationFee) : null;
        updateData.bio = formData.bio.trim();
      }

      if (currentUser.role === 'patient') {
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
      setSuccess('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      onProfileUpdate(updatedUser);
      
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-container">
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <UserProfileCommon 
          formData={formData}
          isEditing={isEditing}
          onChange={handleChange}
        />

        {currentUser.role === 'doctor' && (
          <DoctorProfileSection
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
            currentUser={currentUser}
          />
        )}

        {currentUser.role === 'patient' && (
          <PatientProfileSection
            formData={formData}
            isEditing={isEditing}
            onChange={handleChange}
          />
        )}

        {isEditing && (
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="btn-cancel"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-save"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserProfile;