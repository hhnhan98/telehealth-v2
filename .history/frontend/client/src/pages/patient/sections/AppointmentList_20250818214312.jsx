import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchAppointments,
  cancelAppointment,
  verifyOtp,
  resendOtp
} from '../../../services/bookingService';
import './AppointmentList.css';

// --- Mapping trạng thái ---
const STATUS_LABELS = {
  pending: 'Chờ xác thực',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã khám'
};

// --- Mapping màu trạng thái ---
const STATUS_CLASSES = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed'
};

// --- Timer helper
const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
};

// --- Time display helper
const formatTime = (datetime) =>
  new Date(datetime).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  const [otpData, setOtpData] = useState({}); // { [id]: { value, timer } }

  // --- Toast
  const showToast = useCallback((message, type='success', duration=3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  }, []);

  // --- Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments();
      setAppointments(data.appointments || []);
      setError('');
    } catch (err) {
      console.error('Load appointments error:', err.response?.data || err.message);
      setError('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // --- Cancel appointment
  const handleCancel = useCallback(async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công');
      loadAppointments();
    } catch (err) {
      console.error('Cancel appointment error:', err.response?.data || err.message);
      showToast(err?.response?.data?.error || 'Lỗi khi hủy lịch hẹn', 'error');
    }
  }, [loadAppointments, showToast]);

  // --- OTP handlers
  const handleOtpChange = (id, value) => {
    setOtpData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), value }
    }));
  };

  const handleVerifyOtp = useCallback(async (id) => {
    const otp = otpData[id]?.value;
    if (!otp) return showToast('Vui lòng nhập OTP', 'error');
    try {
      await verifyOtp(id, otp);
      showToast('Xác thực OTP thành công');
      setOtpData(prev => ({ ...prev, [id]: { ...prev[id], value: '' } }));
      loadAppointments();
    } catch (err) {
      console.error('Verify OTP error:', err.response?.data || err.message);
      showToast(err?.response?.data?.error || 'OTP không chính xác hoặc hết hạn', 'error');
    }
  }, [otpData, showToast, loadAppointments]);

  const handleResendOtp = useCallback(async (id) => {
    try {
      await resendOtp(id);
      showToast('OTP mới đã được gửi');

      let timer = 300;
      setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), timer } }));

      const interval = setInterval(() => {
        setOtpData(prev => {
          const newTime = prev[id]?.timer - 1;
          if (newTime <= 0) { clearInterval(interval); return { ...prev, [id]: { ...(prev[id] || {}), timer: 0 } }; }
          return { ...prev, [id]: { ...(prev[id] || {}), timer: newTime } };
        });
      }, 1000);
    } catch (err) {
      console.error('Resend OTP error:', err.response?.data || err.message);
      showToast(err?.response?.data?.error || 'Gửi lại OTP thất bại', 'error');
    }
  }, [showToast]);

  const renderStatus = (status) => (
    <span className={`status ${STATUS_CLASSES[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  return (
    <div className="appointment-list-container">
      <h2>Lịch sử lịch hẹn</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
        </div>
      )}

      {loading ? <p>Đang tải...</p> :
        error ? <p className="error">{error}</p> :
        appointments.length === 0 ? <p>Chưa có lịch hẹn nào</p> :
        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Cơ sở</th>
                <th>Chuyên khoa</th>
                <th>Bác sĩ</th>
                <th>Lý do khám</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => {
                const otpTimer = otpData[appt._id]?.timer || 0;
                return (
                  <tr key={appt._id}>
                    <td>{formatTime(appt.datetime)}</td>
                    <td>{appt.location?.name || '-'}</td>
                    <td>{appt.specialty?.name || '-'}</td>
                    <td>{appt.doctor?.fullName || '-'}</td>
                    <td>{appt.reason || '-'}</td>
                    <td>{renderStatus(appt.status)}</td>
                    <td>
                      {appt.status === 'pending' && (
                        <>
                          <input
                            type="text"
                            placeholder="OTP"
                            value={otpData[appt._id]?.value || ''}
                            onChange={e => handleOtpChange(appt._id, e.target.value)}
                            className="otp-input"
                          />
                          <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">
                            Xác thực
                          </button>
                          <br />
                          <button
                            disabled={otpTimer > 0}
                            onClick={() => handleResendOtp(appt._id)}
                            className={`btn-resend ${otpTimer>0?'disabled':''}`}
                          >
                            Gửi lại OTP {otpTimer>0 ? `(${formatTimer(otpTimer)})` : ''}
                          </button>
                        </>
                      )}
                      {(appt.status === 'pending' || appt.status === 'confirmed') && (
                        <button onClick={() => handleCancel(appt._id)} className="btn-cancel">Hủy</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default AppointmentList;

// import React, { useEffect, useState } from 'react';
// import { fetchAppointments, cancelAppointment, verifyOtp, resendOtp } from '../../../services/bookingService';
// import './AppointmentList.css';

// const AppointmentList = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [otpInputs, setOtpInputs] = useState({});
//   const [otpTimers, setOtpTimers] = useState({});
//   const [toast, setToast] = useState({ message: '', type: '' });

//   // Hiển thị toast
//   const showToast = (message, type = 'success', duration = 3000) => {
//     setToast({ message, type });
//     setTimeout(() => setToast({ message: '', type: '' }), duration);
//   };

//   // Load appointments
//   const loadAppointments = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchAppointments();
//       setAppointments(data.appointments || []);
//     } catch (err) {
//       console.error('Load appointments error:', err.response?.data || err.message);
//       setError('Lỗi khi tải lịch hẹn');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadAppointments(); }, []);

//   // Hủy lịch hẹn
//   const handleCancel = async (id) => {
//     if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
//     try {
//       await cancelAppointment(id);
//       showToast('Hủy lịch hẹn thành công');
//       loadAppointments();
//     } catch (err) {
//       console.error('Cancel appointment error:', err.response?.data || err.message);
//       showToast(err?.response?.data?.error || 'Lỗi khi hủy lịch hẹn', 'error');
//     }
//   };

//   // Xử lý input OTP
//   const handleOtpChange = (id, value) => {
//     setOtpInputs(prev => ({ ...prev, [id]: value }));
//   };

//   // Xác thực OTP
//   const handleVerifyOtp = async (id) => {
//     const otp = otpInputs[id];
//     if (!otp) return showToast('Vui lòng nhập OTP', 'error');
//     try {
//       await verifyOtp(id, otp);
//       showToast('Xác thực OTP thành công');
//       setOtpInputs(prev => ({ ...prev, [id]: '' }));
//       loadAppointments();
//     } catch (err) {
//       console.error('Verify OTP error:', err.response?.data || err.message);
//       showToast(err?.response?.data?.error || 'OTP không chính xác hoặc hết hạn', 'error');
//     }
//   };

//   // Gửi lại OTP
//   const handleResendOtp = async (id) => {
//     try {
//       await resendOtp(id);
//       showToast('OTP mới đã được gửi');
//       let timer = 300; // 5 phút
//       setOtpTimers(prev => ({ ...prev, [id]: timer }));
//       const interval = setInterval(() => {
//         setOtpTimers(prev => {
//           const newTime = prev[id] - 1;
//           if (newTime <= 0) {
//             clearInterval(interval);
//             return { ...prev, [id]: 0 };
//           }
//           return { ...prev, [id]: newTime };
//         });
//       }, 1000);
//     } catch (err) {
//       console.error('Resend OTP error:', err.response?.data || err.message);
//       showToast('Không thể gửi lại OTP', 'error');
//     }
//   };

//   const formatTime = (datetime) => new Date(datetime).toLocaleString('vi-VN', {
//     hour: '2-digit', minute: '2-digit',
//     day: '2-digit', month: '2-digit', year: 'numeric'
//   });

//   const renderStatus = (status) => {
//     switch (status) {
//       case 'pending': return <span className="status pending">Chờ xác thực</span>;
//       case 'confirmed': return <span className="status confirmed">Đã xác nhận</span>;
//       case 'cancelled': return <span className="status cancelled">Đã hủy</span>;
//       case 'completed': return <span className="status completed">Đã khám</span>;
//       default: return <span>{status}</span>;
//     }
//   };

//   const formatTimer = (seconds) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s.toString().padStart(2,'0')}`;
//   };

//   return (
//     <div className="appointment-list-container">
//       <h2>Lịch sử lịch hẹn</h2>

//       {toast.message && (
//         <div className={`toast ${toast.type}`}>
//           {toast.message}
//           <span className="close" onClick={() => setToast({ message: '', type: '' })}>&times;</span>
//         </div>
//       )}

//       {loading ? <p>Đang tải...</p> :
//         error ? <p className="error">{error}</p> :
//         appointments.length === 0 ? <p>Chưa có lịch hẹn nào</p> :
//         <div className="appointment-table-wrapper">
//           <table className="appointment-table">
//             <thead>
//               <tr>
//                 <th>Thời gian</th>
//                 <th>Cơ sở</th>
//                 <th>Chuyên khoa</th>
//                 <th>Bác sĩ</th>
//                 <th>Lý do khám</th>
//                 <th>Trạng thái</th>
//                 <th>Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {appointments.map(appt => (
//                 <tr key={appt._id}>
//                   <td>{formatTime(appt.datetime)}</td>
//                   <td>{appt.location?.name || '-'}</td>
//                   <td>{appt.specialty?.name || '-'}</td>
//                   <td>{appt.doctor?.fullName || '-'}</td>
//                   <td>{appt.reason || '-'}</td>
//                   <td>{renderStatus(appt.status)}</td>
//                   <td>
//                     {appt.status === 'pending' && (
//                       <>
//                         <input
//                           type="text"
//                           placeholder="OTP"
//                           value={otpInputs[appt._id] || ''}
//                           onChange={e => handleOtpChange(appt._id, e.target.value)}
//                           className="otp-input"
//                         />
//                         <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">Xác thực</button>
//                         <br />
//                         <button
//                           disabled={otpTimers[appt._id] > 0}
//                           onClick={() => handleResendOtp(appt._id)}
//                           className="btn-resend"
//                         >
//                           Gửi lại OTP {otpTimers[appt._id] > 0 ? `(${formatTimer(otpTimers[appt._id])})` : ''}
//                         </button>
//                       </>
//                     )}
//                     {(appt.status === 'pending' || appt.status === 'confirmed') &&
//                       <button onClick={() => handleCancel(appt._id)} className="btn-cancel">Hủy</button>
//                     }
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       }
//     </div>
//   );
// };

// export default AppointmentList;
