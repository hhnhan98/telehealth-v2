import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './a.css';
import authService from '../../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await authService.login(formData);

      // Điều hướng theo role
      if (user.role === 'doctor') {
        navigate('/doctor');
      } else if (user.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
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
          <h2>Đăng nhập</h2>

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mật khẩu</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="auth-footer">
            Chưa có tài khoản?{' '}
            <span onClick={() => navigate('/register')}>Đăng ký ngay</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

// import React, { useState } from 'react';
// import './LoginPage.css';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../../utils/axiosInstance';

// function LoginPage() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Chỉ gửi email và password để login
//       const res = await axiosInstance.post('/auth/login', {
//         email: formData.email,
//         password: formData.password
//       });

//       const { token, user } = res.data;

//       // Lưu token và user info vào localStorage
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));

//       // Điều hướng theo vai trò
//       if (user.role === 'doctor') {
//         navigate('/doctor');
//       } else if (user.role === 'patient') {
//         navigate('/patient');
//       } else {
//         navigate('/');
//       }

//     } catch (error) {
//       console.error('Lỗi đăng nhập chi tiết:', error.response?.data || error.message);
//       alert(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-left">
//         <h1>Telehealth</h1>
//         <p>Hệ thống khám bệnh từ xa</p>
//       </div>

//       <div className="auth-right">
//         <form onSubmit={handleSubmit} className="auth-form">
//           <h2>Đăng nhập</h2>

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
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? 'Ẩn' : 'Hiện'}
//             </button>
//           </div>

//           <button type="submit" className="auth-btn" disabled={loading}>
//             {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
//           </button>

//           <p className="auth-footer">
//             Chưa có tài khoản?{' '}
//             <span onClick={() => navigate('/register')}>Đăng ký ngay</span>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;
