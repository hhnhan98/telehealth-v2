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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Modal from "../../components/Modal"; // modal bạn đưa ở trên

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Giả lập API fetch
  useEffect(() => {
    // TODO: thay bằng gọi API thật /api/doctors/work-schedule
    setAppointments([
      {
        _id: "1",
        time: "09:00",
        patientName: "Nguyễn Văn A",
        reason: "Khám tổng quát",
        status: "booked",
      },
      {
        _id: "2",
        time: "09:30",
        status: "free",
      },
    ]);
  }, [selectedDate]);

  const handlePrev = () => setSelectedDate((d) => d.subtract(1, "day"));
  const handleNext = () => setSelectedDate((d) => d.add(1, "day"));

  const openModal = (appt) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Doctor Dashboard</h1>

      {/* Header date controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrev}
          className="px-3 py-1 border rounded shadow-sm bg-gray-100"
        >
          ◀
        </button>
        <input
          type="date"
          value={selectedDate.format("YYYY-MM-DD")}
          onChange={(e) => setSelectedDate(dayjs(e.target.value))}
          className="border px-3 py-1 rounded"
        />
        <button
          onClick={handleNext}
          className="px-3 py-1 border rounded shadow-sm bg-gray-100"
        >
          ▶
        </button>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-4 gap-4">
        {appointments.map((appt) => (
          <div
            key={appt._id}
            className={`p-4 rounded shadow cursor-pointer text-center ${
              appt.status === "booked"
                ? "bg-red-100 border border-red-300"
                : "bg-green-100 border border-green-300"
            }`}
            onClick={() =>
              appt.status === "booked" ? openModal(appt) : null
            }
          >
            <p className="font-medium">{appt.time}</p>
            <p className="text-sm">
              {appt.status === "booked" ? "Đã đặt" : "Trống"}
            </p>
          </div>
        ))}
      </div>

      {/* Modal preview */}
      {isModalOpen && selectedAppointment && (
        <Modal title="Chi tiết lịch hẹn" onClose={closeModal}>
          <p>
            <strong>Giờ:</strong> {selectedAppointment.time}
          </p>
          <p>
            <strong>Bệnh nhân:</strong>{" "}
            {selectedAppointment.patientName || "Ẩn danh"}
          </p>
          <p>
            <strong>Lý do:</strong> {selectedAppointment.reason || "-"}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Đóng
            </button>
            <button
              onClick={() =>
                navigate(`/doctor/appointments/${selectedAppointment._id}`)
              }
              className="px-4 py-2 rounded bg-blue-600 text-white"
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
