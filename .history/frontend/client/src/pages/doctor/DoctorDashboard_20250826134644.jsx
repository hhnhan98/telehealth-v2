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

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import doctorService from "../../services/doctorService";
import Modal from "../../components/ui/Modal";

const DoctorDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await doctorService.fetchDashboard();
        setDashboard(data);
        setAppointments(data.todayAppointments || []);
      } catch (err) {
        setError("Không thể tải dữ liệu dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handlePrevDay = () =>
    setSelectedDate(
      (prev) => new Date(prev.setDate(prev.getDate() - 1))
    );

  const handleNextDay = () =>
    setSelectedDate(
      (prev) => new Date(prev.setDate(prev.getDate() + 1))
    );

  const handleSlotClick = (appt) => {
    if (appt.status === "booked") {
      setSelectedAppointment(appt);
      setModalOpen(true);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lịch làm việc bác sĩ</h1>

      {/* Statistic Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-2xl shadow">
            <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
            <p className="text-2xl font-semibold">
              {dashboard.todayAppointments?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-2xl shadow">
            <p className="text-sm text-gray-600">Tổng số lịch hẹn</p>
            <p className="text-2xl font-semibold">
              {dashboard.totalAppointments || 0}
            </p>
          </div>
        </div>
      )}

      {/* Date Navigation */}
      <div className="flex items-center justify-center mb-6 space-x-4">
        <button
          onClick={handlePrevDay}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ◀
        </button>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border rounded px-3 py-1"
        />
        <button
          onClick={handleNextDay}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ▶
        </button>
      </div>

      {/* Slot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <div
              key={appt._id}
              onClick={() => handleSlotClick(appt)}
              className={`p-4 rounded-2xl shadow cursor-pointer transition transform hover:scale-105 ${
                appt.status === "booked"
                  ? "bg-red-100 hover:bg-red-200"
                  : "bg-green-100 hover:bg-green-200"
              }`}
            >
              <p className="text-lg font-medium">{appt.time}</p>
              <p
                className={`text-sm ${
                  appt.status === "booked"
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {appt.status === "booked" ? "Đã đặt" : "Trống"}
              </p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Không có lịch hẹn trong ngày này.
          </p>
        )}
      </div>

      {/* Modal Preview */}
      {modalOpen && selectedAppointment && (
        <Modal
          title="Chi tiết lịch hẹn"
          onClose={() => setModalOpen(false)}
        >
          <p>
            <strong>Giờ:</strong> {selectedAppointment.time}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {selectedAppointment.status === "booked"
              ? "Đã đặt"
              : "Trống"}
          </p>
          {selectedAppointment.patient && (
            <>
              <p>
                <strong>Bệnh nhân:</strong>{" "}
                {selectedAppointment.patient.name}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {selectedAppointment.patient.email}
              </p>
            </>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() =>
                navigate(
                  `/doctor/appointments/${selectedAppointment._id}`
                )
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Xem chi tiết
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorDashboard;

