// // src/pages/doctor/DoctorDashboard.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import doctorService from '../../services/doctorService';
// import './styles/DoctorDashboard.css';

// const SLOT_TIMES = [
//   '08:00', '08:30', '09:00', '09:30',
//   '10:00', '10:30', '11:00', '11:30',
//   '13:00', '13:30', '14:00', '14:30',
//   '15:00', '15:30', '16:00', '16:30'
// ];

// // const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// const DoctorDashboard = () => {
//   const [dashboard, setDashboard] = useState({ todayAppointments: [], totalAppointments: 0 });
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // ===== Load dashboard =====
//   const loadDashboard = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await doctorService.fetchDashboard();
//       if (res?.success && res.data) {
//         setDashboard({
//           todayAppointments: res.data.todayAppointments || [],
//           totalAppointments: res.data.todayAppointments?.length || 0
//         });
//         setError(null);
//       } else throw new Error(res?.message || 'Không thể tải dashboard');
//     } catch (err) {
//       console.error('>>> Error loading dashboard:', err);
//       setError(err.message || 'Lỗi tải dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadDashboard();
//   }, [loadDashboard]);

//   // ===== Calendar controls =====
//   const handlePrevDay = () => setSelectedDate(prev => new Date(prev.getTime() - 24*60*60*1000));
//   const handleNextDay = () => setSelectedDate(prev => new Date(prev.getTime() + 24*60*60*1000));
//   // const handleChangeDate = (e) => setSelectedDate(new Date(e.target.value));

//   // const formatDate = (date) => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

//   // ===== Lấy danh sách slot cho ngày =====
//   const getSlotsForDate = () => {
//     if (!selectedDate) return SLOT_TIMES.map(time => ({ time, booked: false }));

//     return SLOT_TIMES.map(time => {
//       const appt = dashboard.todayAppointments.find(a => {
//         const apptDate = new Date(a.datetime);
//         return apptDate.toDateString() === selectedDate.toDateString() &&
//                apptDate.getHours() === parseInt(time.split(':')[0], 10) &&
//                apptDate.getMinutes() === parseInt(time.split(':')[1], 10);
//       });
//       return { time, booked: !!appt, patient: appt?.patient?.fullName, id: appt?._id };
//     });
//   };

//   if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
//   if (error) return <div><p>{error}</p><button onClick={loadDashboard}>Thử lại</button></div>;

//   const slots = getSlotsForDate();

//   return (
//     <div className="doctor-dashboard">
//       <div className="calendar-section">
//         {/* Calendar controls */}
//         <div className="calendar-controls">
//           <button onClick={handlePrevDay} className="btn-control">{'<'}</button>
//           <div className="date-picker-wrapper">
//             <input
//               type="date"
//               className="date-picker"
//               value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
//               onChange={(e) => {
//                 if (!e.target.value) setSelectedDate(null);
//                 else setSelectedDate(new Date(e.target.value));
//               }}
//             />
//           </div>
//           <button onClick={handleNextDay} className="btn-control">{'>'}</button>
//         </div>

//         {/* Slot Grid */}
//         <div className="slot-grid">
//           {slots.map((slot, index) => (
//             <div
//               key={index}
//               className={`slot ${slot.booked ? 'booked' : 'free'}`}
//               title={slot.booked ? `Bệnh nhân: ${slot.patient}` : 'Trống'}
//               onClick={() => slot.booked && navigate(`/doctor/appointments/${slot.id}`)}
//             >
//               {slot.time}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Card thống kê */}
//       <div className="dashboard-cards">
//         <div className="stat-card">
//           <h4>Tổng số lịch hẹn hôm nay</h4>
//           <p>{dashboard.totalAppointments || 0}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;

// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';
import './styles/DoctorDashboard.css';

const SLOT_TIMES = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({ todayAppointments: [], totalAppointments: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [appointmentDetail, setAppointmentDetail] = useState(null);

  const navigate = useNavigate();

  // ===== Load dashboard =====
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorService.fetchDashboard();
      if (res?.success && res.data) {
        setDashboard({
          todayAppointments: res.data.todayAppointments || [],
          totalAppointments: res.data.todayAppointments?.length || 0
        });
        setError(null);
      } else throw new Error(res?.message || 'Không thể tải dashboard');
    } catch (err) {
      console.error('>>> Error loading dashboard:', err);
      setError(err.message || 'Lỗi tải dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ===== Calendar controls =====
  const handlePrevDay = () => setSelectedDate(prev => prev ? new Date(prev.getTime() - 24*60*60*1000) : new Date());
  const handleNextDay = () => setSelectedDate(prev => prev ? new Date(prev.getTime() + 24*60*60*1000) : new Date());
  // handle date input change safely (avoid crash if cleared)
  const handleChangeDate = (e) => {
    const v = e.target.value;
    if (!v) setSelectedDate(null);
    else {
      // create Date in local timezone based on yyyy-mm-dd
      const parts = v.split('-').map(Number);
      // parts: [yyyy,mm,dd]
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      setSelectedDate(d);
    }
  };

  // safe format for date input
  const dateInputValue = selectedDate ? (() => {
    try {
      return selectedDate.toISOString().split('T')[0];
    } catch {
      return '';
    }
  })() : '';

  // ===== Lấy danh sách slot cho ngày =====
  const getSlotsForDate = () => {
    if (!selectedDate) return SLOT_TIMES.map(time => ({ time, booked: false }));

    return SLOT_TIMES.map(time => {
      const appt = dashboard.todayAppointments.find(a => {
        // ensure a.datetime exists
        if (!a?.datetime) return false;
        const apptDate = new Date(a.datetime);
        return apptDate.toDateString() === selectedDate.toDateString() &&
               apptDate.getHours() === parseInt(time.split(':')[0], 10) &&
               apptDate.getMinutes() === parseInt(time.split(':')[1], 10);
      });
      return { time, booked: !!appt, patient: appt?.patient?.fullName || '', id: appt?._id || null, raw: appt || null };
    });
  };

  // ===== Modal / Appointment detail loader =====
  const openAppointmentModal = async (appointmentId) => {
    if (!appointmentId) return;
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setAppointmentDetail(null);

    // Try doctorService.getAppointmentById, otherwise fallback to fetch
    try {
      let res;
      if (doctorService.getAppointmentById) {
        res = await doctorService.getAppointmentById(appointmentId);
        // expected shape: { success: true, data: { appointment: {...} } } or { success: true, appointment: {...} }
        if (res?.success && (res.data?.appointment || res.appointment)) {
          const appointment = res.data?.appointment || res.appointment;
          setAppointmentDetail(appointment);
        } else if (res?.success && res.data) {
          setAppointmentDetail(res.data); // fallback
        } else {
          // if doctorService returns appointment directly
          setAppointmentDetail(res);
        }
      } else {
        // fallback fetch
        const resp = await fetch(`/api/doctors/appointments/${appointmentId}`, { credentials: 'include' });
        if (!resp.ok) throw new Error(`Lỗi tải chi tiết (${resp.status})`);
        const json = await resp.json();
        // expect { success: true, data: { appointment: {...} } } or { success: true, appointment: {...} }
        const appointment = json?.data?.appointment || json?.appointment || json?.data || json;
        setAppointmentDetail(appointment);
      }
    } catch (err) {
      console.error('Lỗi load appointment detail:', err);
      setModalError(err.message || 'Không thể tải chi tiết lịch hẹn');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setAppointmentDetail(null);
    setModalError(null);
  };

  // update status (confirmed / cancelled)
  const updateAppointmentStatus = async (appointmentId, status) => {
    if (!appointmentId) return;
    try {
      // prefer doctorService.updateAppointmentStatus
      let res;
      if (doctorService.updateAppointmentStatus) {
        res = await doctorService.updateAppointmentStatus(appointmentId, { status });
      } else {
        // fallback PATCH
        res = await fetch(`/api/doctors/appointments/${appointmentId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status })
        });
        res = await res.json();
      }

      // handle result shapes
      if (res?.success) {
        // reload dashboard to reflect change
        await loadDashboard();
        // optionally re-load appointment detail
        await openAppointmentModal(appointmentId);
      } else {
        throw new Error(res?.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      console.error('Lỗi updateAppointmentStatus:', err);
      setModalError(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
  if (error) return <div><p>{error}</p><button onClick={loadDashboard}>Thử lại</button></div>;

  const slots = getSlotsForDate();

  return (
    <div className="doctor-dashboard">
      <div className="calendar-section">
        {/* Calendar controls */}
        <div className="calendar-controls">
          <button onClick={handlePrevDay} className="btn-control">{'<'}</button>

          <div className="date-picker-wrapper">
            <input
              type="date"
              className="date-picker"
              value={dateInputValue}
              onChange={handleChangeDate}
            />
          </div>

          <button onClick={handleNextDay} className="btn-control">{'>'}</button>
        </div>

        {/* Slot Grid */}
        <div className="slot-grid" role="list" aria-label="Grid of appointment slots">
          {slots.map((slot, idx) => (
            <div
              key={slot.time + '-' + idx}
              role="listitem"
              className={`slot ${slot.booked ? 'booked' : 'free'}`}
              title={slot.booked ? `Bệnh nhân: ${slot.patient}` : 'Trống'}
              onClick={() => {
                if (slot.booked && slot.id) {
                  // open modal preview (preferred) instead of immediate navigation
                  openAppointmentModal(slot.id);
                }
              }}
            >
              {slot.time}
            </div>
          ))}
        </div>
      </div>

      {/* Card thống kê */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <h4>Tổng số lịch hẹn hôm nay</h4>
          <p>{dashboard.totalAppointments || 0}</p>
        </div>
      </div>

      {/* Modal preview (simple implementation) */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal} style={backdropStyle}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={modalCardStyle}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={closeModal} style={modalCloseStyle} aria-label="Đóng">✕</button>

            {modalLoading ? (
              <div style={{ padding: '1rem' }}>Đang tải chi tiết...</div>
            ) : modalError ? (
              <div style={{ padding: '1rem', color: 'crimson' }}>
                {modalError}
              </div>
            ) : appointmentDetail ? (
              <div style={{ padding: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>Chi tiết lịch hẹn</h3>

                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>Giờ:</strong> {appointmentDetail.time || formatDateTime(appointmentDetail.datetime) || '—'}
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>Bệnh nhân:</strong> {appointmentDetail.patient?.fullName || appointmentDetail.patient?.name || '—'}
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>SĐT:</strong> {appointmentDetail.patient?.phone || '—'}
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>Lí do:</strong> {appointmentDetail.reason || '—'}
                </div>

                <div style={{ marginBottom: '0.6rem' }}>
                  <strong>Trạng thái OTP:</strong> {appointmentDetail.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <strong>Trạng thái lịch:</strong> {appointmentDetail.status || '—'}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                  {appointmentDetail.status !== 'confirmed' && (
                    <button
                      className="btn-control"
                      onClick={() => updateAppointmentStatus(appointmentDetail._id, 'confirmed')}
                    >
                      Xác nhận
                    </button>
                  )}

                  {appointmentDetail.status !== 'cancelled' && (
                    <button
                      className="btn-control"
                      onClick={() => updateAppointmentStatus(appointmentDetail._id, 'cancelled')}
                    >
                      Hủy
                    </button>
                  )}

                  <button
                    className="btn-control"
                    onClick={() => {
                      // navigate to full appointment detail page
                      closeModal();
                      navigate(`/doctor/appointments/${appointmentDetail._id}`);
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem' }}>Không có dữ liệu.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Inline minimal styles for modal (you can move to CSS file) ---------- */

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const modalCardStyle = {
  width: 'min(560px, 92%)',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
  position: 'relative',
  padding: '1rem 1.2rem 1.4rem',
};

const modalCloseStyle = {
  position: 'absolute',
  top: 8,
  right: 10,
  border: 'none',
  background: 'transparent',
  fontSize: 18,
  cursor: 'pointer',
};

/* helper for display */
function formatDateTime(datetime) {
  if (!datetime) return '';
  try {
    const d = new Date(datetime);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return String(datetime);
  }
}

export default DoctorDashboard;
