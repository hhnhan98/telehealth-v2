// components/OTPVerification.jsx
import React, { useState } from 'react';
import { sendOTP, verifyOTP } from '../../services/otpService';

const OTPVerification = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP
  const [message, setMessage] = useState('');

  const handleSendOTP = async () => {
    try {
      const res = await sendOTP(email);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi khi gửi OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await verifyOTP(email, otp);
      setMessage(res.message);
      if (res.success) {
        onVerified(email); // báo FE đã verify thành công
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP không hợp lệ');
    }
  };

  return (
    <div className="otp-box">
      <h3>Xác minh OTP qua email</h3>
      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOTP}>Gửi OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Xác minh OTP</button>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default OTPVerification;
