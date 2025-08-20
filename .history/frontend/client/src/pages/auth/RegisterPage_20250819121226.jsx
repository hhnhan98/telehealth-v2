// src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient', // mặc định patient
    specialty: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi authService để đăng ký
      const data = await authService.register(formData);

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Telehealth</h1>
        <p>Hệ thống khám bệnh từ xa</p>
      </div>

      <div className="auth-right">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Đăng ký</h2>

          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Vai trò</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Bệnh nhân</option>
            <option value="doctor">Bác sĩ</option>
          </select>

          {formData.role === 'doctor' && (
            <>
              <label>Chuyên khoa</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required={formData.role === 'doctor'}
              />

              <label>Cơ sở</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required={formData.role === 'doctor'}
              />
            </>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>

          <p className="auth-footer">
            Đã có tài khoản?{' '}
            <span onClick={() => navigate('/login')}>Đăng nhập ngay</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../../utils/axiosInstance';
// import './LoginPage.css';

// const RegisterPage = () => {
//   const navigate = useNavigate();
//   const [specialties, setSpecialties] = useState([]);
//   const [locations, setLocations] = useState([]);

//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     role: 'patient', // mặc định bệnh nhân
//     specialty: '',
//     location: '',
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loadingOptions, setLoadingOptions] = useState(true);

//   // --- Fetch specialties & locations từ BE ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [specRes, locRes] = await Promise.all([
//           axiosInstance.get('/specialties'),
//           axiosInstance.get('/locations'),
//         ]);
//         setSpecialties(specRes.data);
//         setLocations(locRes.data);
//       } catch (err) {
//         console.error('Lỗi tải dữ liệu:', err);
//       } finally {
//         setLoadingOptions(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleChange = e => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     try {
//       const dataToSend = {
//         fullName: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//       };

//       // Nếu bác sĩ, bắt buộc chọn specialty và location
//       if (formData.role === 'doctor') {
//         if (!formData.specialty || !formData.location) {
//           alert('Vui lòng chọn chuyên khoa và cơ sở y tế');
//           return;
//         }
//         dataToSend.specialty = formData.specialty;
//         dataToSend.location = formData.location;
//       }

//       const res = await axiosInstance.post('/auth/register', dataToSend);
//       console.log('Đăng ký thành công:', res.data);
//       alert('Đăng ký thành công!');
//       navigate('/login');
//     } catch (error) {
//       console.error('Lỗi đăng ký:', error);
//       alert(error.response?.data?.message || 'Đã có lỗi xảy ra!');
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-left">
//         <h1>Telehealth</h1>
//         <p>Đăng ký tài khoản để bắt đầu</p>
//       </div>

//       <div className="auth-right">
//         <form className="auth-form" onSubmit={handleSubmit}>
//           <h2>Đăng ký</h2>

//           <label>Họ tên</label>
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             required
//           />

//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />

//           <label>Mật khẩu</label>
//           <div className="password-wrapper">
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//             <button
//               type="button"
//               className="toggle-password"
//               onClick={() => setShowPassword(prev => !prev)}
//             >
//               {showPassword ? 'Ẩn' : 'Hiện'}
//             </button>
//           </div>

//           <label>Vai trò</label>
//           <select name="role" value={formData.role} onChange={handleChange}>
//             <option value="patient">Bệnh nhân</option>
//             <option value="doctor">Bác sĩ</option>
//           </select>

//           {/* Hiển thị dropdown chỉ khi chọn bác sĩ */}
//           {formData.role === 'doctor' && (
//             <>
//               <label>Chuyên khoa</label>
//               <select
//                 name="specialty"
//                 value={formData.specialty}
//                 onChange={handleChange}
//                 disabled={loadingOptions}
//                 required
//               >
//                 <option value="">-- Chọn chuyên khoa --</option>
//                 {specialties.map(s => (
//                   <option key={s._id} value={s._id}>{s.name}</option>
//                 ))}
//               </select>

//               <label>Cơ sở y tế</label>
//               <select
//                 name="location"
//                 value={formData.location}
//                 onChange={handleChange}
//                 disabled={loadingOptions}
//                 required
//               >
//                 <option value="">-- Chọn cơ sở --</option>
//                 {locations.map(l => (
//                   <option key={l._id} value={l._id}>{l.name}</option>
//                 ))}
//               </select>
//             </>
//           )}

//           <button type="submit" className="auth-btn">Đăng ký</button>

//           <div className="auth-footer">
//             <span onClick={() => navigate('/login')}>
//               Đã có tài khoản? Đăng nhập
//             </span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
