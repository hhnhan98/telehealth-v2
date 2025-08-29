import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from '../../services';
import { useNavigate } from 'react-router-dom';
import '../../styles/global.css';

const STATUS_LABELS = {
  pending: 'Chờ xác thực',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã khám',
  expired: 'Đã quá hạn'
};

const STATUS_CLASSES = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed',
  expired: 'ex'
};

// Hiển thị datetime theo VN (dùng datetimeVN từ backend)
const formatTimeVN = (datetimeVN) =>
  new Date(datetimeVN).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [otpData, setOtpData] = useState({});
  const navigate = useNavigate();

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), duration);
  }, []);

  // Lấy danh sách lịch hẹn của bệnh nhân
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAppointments();
      setAppointments(res || []);
      setError('');
    } catch (err) {
      console.error('Load appointments error:', err.message || err);
      setError('Lỗi khi tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Hủy lịch hẹn
  const handleCancel = useCallback(async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    try {
      await bookingService.cancelAppointment(id);
      showToast('Hủy lịch hẹn thành công');
      loadAppointments();
    } catch (err) {
      console.error('Cancel appointment error:', err.message || err);
      showToast('Lỗi khi hủy lịch hẹn', 'error');
    }
  }, [loadAppointments, showToast]);

  // OTP handling
  const handleOtpChange = (id, value) => {
    setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), value } }));
  };

  const handleVerifyOtp = useCallback(async (id) => {
    const otp = otpData[id]?.value;
    if (!id || !otp) return showToast('Thiếu appointmentId hoặc OTP', 'error');

    try {
      const res = await bookingService.verifyOtp(id, otp);
      if (res?.success) {
        showToast('Xác thực OTP thành công');
        setAppointments(prev => prev.map(appt =>
          appt._id === id ? { ...appt, status: 'confirmed' } : appt
        ));
        setOtpData(prev => ({ ...prev, [id]: { ...prev[id], value: '', timer: 0 } }));
      } else {
        showToast(res?.message || 'Xác thực OTP thất bại', 'error');
      }
    } catch (err) {
      console.error('Verify OTP error:', err.message || err);
      showToast('OTP không chính xác hoặc hết hạn', 'error');
    }
  }, [otpData, showToast]);

  const handleResendOtp = useCallback(async (id) => {
    try {
      await bookingService.resendOtp(id);
      showToast('OTP mới đã được gửi');

      let timer = 300;
      setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), timer } }));

      const interval = setInterval(() => {
        setOtpData(prev => {
          const newTime = (prev[id]?.timer || 0) - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            return { ...prev, [id]: { ...(prev[id] || {}), timer: 0 } };
          }
          return { ...prev, [id]: { ...(prev[id] || {}), timer: newTime } };
        });
      }, 1000);
    } catch (err) {
      console.error('Resend OTP error:', err.message || err);
      showToast('Gửi lại OTP thất bại', 'error');
    }
  }, [showToast]);

  const renderStatus = (status) => (
    <span className={`status ${STATUS_CLASSES[status] || ''}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  return (
    <div className="appointment-list-container">
      <h2>Lịch sử đặt lịch</h2>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
          <span className="close" onClick={() => setToast({ message: '', type: '' })}>
            &times;
          </span>
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
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => {
                    const otpTimer = otpData[appt._id]?.timer || 0;
                    return (
                      <tr key={appt._id}>
                        <td>{appt.datetimeVN ? formatTimeVN(appt.datetimeVN) : '-'}</td>
                        <td>{appt.location?.name || '-'}</td>
                        <td>{appt.specialty?.name || '-'}</td>
                        <td>{appt.doctor?.fullName || '-'}</td>                       
                        <td>{renderStatus(appt.status)}</td>
                        <td>
                          {/* OTP */}
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
                                className={`btn-resend ${otpTimer > 0 ? 'disabled' : ''}`}
                              >
                                Gửi lại OTP {otpTimer > 0 ? `(${formatTimer(otpTimer)})` : ''}
                              </button>
                            </>
                          )}

                          {/* Cancel */}
                          {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <button onClick={() => handleCancel(appt._id)} className="btn-cancel">
                              Hủy
                            </button>
                          )}

                          {/* Detail */}
                          <button onClick={() => navigate(`/patient/appointments/${appt._id}`)} className="btn-info">
                            Xem chi tiết
                          </button>
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

// import React, { useEffect, useState, useCallback } from 'react';
// import { bookingService } from '../../services';
// import { useNavigate } from 'react-router-dom';
// import '../../styles/global.css';

// const STATUS_LABELS = {
//   pending: 'Chờ xác thực',
//   confirmed: 'Đã xác nhận',
//   cancelled: 'Đã hủy',
//   completed: 'Đã khám'
// };

// const STATUS_CLASSES = {
//   pending: 'pending',
//   confirmed: 'confirmed',
//   cancelled: 'cancelled',
//   completed: 'completed'
// };

// const formatTime = (datetime) =>
//   new Date(datetime).toLocaleString('vi-VN', {
//     hour: '2-digit',
//     minute: '2-digit',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   });

// const formatTimer = (seconds) => {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, '0')}`;
// };

// const AppointmentList = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [toast, setToast] = useState({ message: '', type: '' });
//   const [otpData, setOtpData] = useState({});
//   const navigate = useNavigate();

//   const showToast = useCallback((message, type = 'success', duration = 3000) => {
//     setToast({ message, type });
//     setTimeout(() => setToast({ message: '', type: '' }), duration);
//   }, []);

//   const loadAppointments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingService.getAppointments(); // trả về mảng trực tiếp
//       setAppointments(res || []);
//       setError('');
//     } catch (err) {
//       console.error('Load appointments error:', err.message || err);
//       setError('Lỗi khi tải lịch hẹn');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadAppointments(); }, [loadAppointments]);

//   const handleCancel = useCallback(async (id) => {
//     if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
//     try {
//       await bookingService.cancelAppointment(id);
//       showToast('Hủy lịch hẹn thành công');
//       loadAppointments();
//     } catch (err) {
//       console.error('Cancel appointment error:', err.message || err);
//       showToast('Lỗi khi hủy lịch hẹn', 'error');
//     }
//   }, [loadAppointments, showToast]);

//   const handleOtpChange = (id, value) => {
//     setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), value } }));
//   };

//   const handleVerifyOtp = useCallback(async (id) => {
//     const otp = otpData[id]?.value;
//     if (!id || !otp) return showToast('Thiếu appointmentId hoặc OTP', 'error');

//     try {
//       const res = await bookingService.verifyOtp(id, otp);
//       if (res?.success) {
//         showToast('Xác thực OTP thành công');
//         setAppointments(prev => prev.map(appt =>
//           appt._id === id ? { ...appt, status: 'confirmed' } : appt
//         ));
//         setOtpData(prev => ({ ...prev, [id]: { ...prev[id], value: '' } }));
//       } else {
//         showToast(res?.message || 'Xác thực OTP thất bại', 'error');
//       }
//     } catch (err) {
//       console.error('Verify OTP error:', err.message || err);
//       showToast('OTP không chính xác hoặc hết hạn', 'error');
//     }
//   }, [otpData, showToast]);

//   const handleResendOtp = useCallback(async (id) => {
//     try {
//       await bookingService.resendOtp(id);
//       showToast('OTP mới đã được gửi');

//       let timer = 300;
//       setOtpData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), timer } }));

//       const interval = setInterval(() => {
//         setOtpData(prev => {
//           const newTime = (prev[id]?.timer || 0) - 1;
//           if (newTime <= 0) {
//             clearInterval(interval);
//             return { ...prev, [id]: { ...(prev[id] || {}), timer: 0 } };
//           }
//           return { ...prev, [id]: { ...(prev[id] || {}), timer: newTime } };
//         });
//       }, 1000);
//     } catch (err) {
//       console.error('Resend OTP error:', err.message || err);
//       showToast('Gửi lại OTP thất bại', 'error');
//     }
//   }, [showToast]);

//   const renderStatus = (status) => (
//     <span className={`status ${STATUS_CLASSES[status] || ''}`}>
//       {STATUS_LABELS[status] || status}
//     </span>
//   );

//   return (
//     <div className="appointment-list-container">
//       <h2>Lịch sử đặt lịch</h2>

//       {toast.message && (
//         <div className={`toast ${toast.type}`}>
//           {toast.message}
//           <span className="close" onClick={() => setToast({ message: '', type: '' })}>
//             &times;
//           </span>
//         </div>
//       )}

//       {loading ? <p>Đang tải...</p> :
//         error ? <p className="error">{error}</p> :
//           appointments.length === 0 ? <p>Chưa có lịch hẹn nào</p> :
//             <div className="appointment-table-wrapper">
//               <table className="appointment-table">
//                 <thead>
//                   <tr>
//                     <th>Thời gian</th>
//                     <th>Cơ sở</th>
//                     <th>Chuyên khoa</th>
//                     <th>Bác sĩ</th>
//                     <th>Trạng thái</th>
//                     <th>Hành động</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {appointments.map(appt => {
//                     const otpTimer = otpData[appt._id]?.timer || 0;
//                     return (
//                       <tr key={appt._id}>
//                         <td>{formatTime(appt.datetime)}</td>
//                         <td>{appt.location?.name || '-'}</td>
//                         <td>{appt.specialty?.name || '-'}</td>
//                         <td>{appt.doctor?.user?.fullName || '-'}</td>
//                         <td>{renderStatus(appt.status)}</td>
//                         <td>
//                           {/* OTP */}
//                           {appt.status === 'pending' && (
//                             <>
//                               <input
//                                 type="text"
//                                 placeholder="OTP"
//                                 value={otpData[appt._id]?.value || ''}
//                                 onChange={e => handleOtpChange(appt._id, e.target.value)}
//                                 className="otp-input"
//                               />
//                               <button onClick={() => handleVerifyOtp(appt._id)} className="btn-verify">
//                                 Xác thực
//                               </button>
//                               <br />
//                               <button
//                                 disabled={otpTimer > 0}
//                                 onClick={() => handleResendOtp(appt._id)}
//                                 className={`btn-resend ${otpTimer > 0 ? 'disabled' : ''}`}
//                               >
//                                 Gửi lại OTP {otpTimer > 0 ? `(${formatTimer(otpTimer)})` : ''}
//                               </button>
//                             </>
//                           )}

//                           {/* Cancel */}
//                           {(appt.status === 'pending' || appt.status === 'confirmed') && (
//                             <button onClick={() => handleCancel(appt._id)} className="btn-cancel">
//                               Hủy
//                             </button>
//                           )}

//                           {/* Detail */}
//                           <button onClick={() => navigate(`/patient/appointments/${appt._id}`)} className="btn-info">
//                             Xem chi tiết
//                           </button>
//                         </td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//       }
//     </div>
//   );
// };

// export default AppointmentList;