// src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import authService from '../../services/authService';
import '../auth/AuthPage.css'; // dùng chung file AuthPage.css

const RegisterPage = () => {
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient', // mặc định bệnh nhân
    specialty: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch specialties & locations từ BE (mount)
  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [specRes, locRes] = await Promise.all([
          axiosInstance.get('/specialties'),
          axiosInstance.get('/locations'),
        ]);

        if (!mounted) return;

        // `specRes.data` và `locRes.data` kỳ vọng là array
        setSpecialties(Array.isArray(specRes?.data) ? specRes.data : []);
        setLocations(Array.isArray(locRes?.data) ? locRes.data : []);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyên khoa/cơ sở:', err);
        // fallback rỗng (UI vẫn hoạt động)
        setSpecialties([]);
        setLocations([]);
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // nếu đổi role từ doctor -> patient thì reset specialty/location
    if (name === 'role' && value === 'patient') {
      setFormData((prev) => ({ ...prev, role: value, specialty: '', location: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    // validate email cơ bản
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ tên.');
      return;
    }
    if (!validateEmail(formData.email)) {
      alert('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (formData.role === 'doctor') {
      if (!formData.specialty) {
        alert('Vui lòng chọn chuyên khoa cho bác sĩ.');
        return;
      }
      if (!formData.location) {
        alert('Vui lòng chọn cơ sở y tế cho bác sĩ.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Prepare payload phù hợp với BE (dùng fullName)
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'doctor') {
        // gửi id chuyên khoa + id cơ sở (giả định BE chấp nhận field `specialty` và `location` là id)
        payload.specialty = formData.specialty;
        payload.location = formData.location;
      }

      // Gọi service đăng ký
      await authService.register(payload);

      // Thành công -> chuyển đến login
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      // Lấy message từ nhiều dạng lỗi (axios/error thrown)
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Đã có lỗi xảy ra khi đăng ký.';
      console.error('Register error:', err);
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Telehealth</h1>
        <p>Đăng ký tài khoản để bắt đầu</p>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng ký</h2>

          <label>Họ tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Nguyễn Văn A"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Tối thiểu 6 ký tự"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((p) => !p)}
              aria-label="Hiển thị mật khẩu"
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <label>Vai trò</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patient">Bệnh nhân</option>
            <option value="doctor">Bác sĩ</option>
          </select>

          {formData.role === 'doctor' && (
            <>
              <label>Chuyên khoa</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                disabled={loadingOptions}
                required
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s._id ?? s.id ?? s.name} value={s._id ?? s.id ?? s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              <label>Cơ sở y tế</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loadingOptions}
                required
              >
                <option value="">-- Chọn cơ sở --</option>
                {locations.map((l) => (
                  <option key={l._id ?? l.id ?? l.name} value={l._id ?? l.id ?? l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" className="auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="auth-footer">
            <span onClick={() => navigate('/login')}>Đã có tài khoản? Đăng nhập</span>
          </div>
        </form>
      </div>
    </div>
  );
};

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
