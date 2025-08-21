import React, { useEffect, useState, useCallback } from 'react';
import { bookingService } from '../../../services';
import './DoctorSchedule.css';

const STATUS_LABELS = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
};

const STATUS_COLORS = {
  pending: '#FFD966',
  confirmed: '#59c2ff',
  cancelled: '#FF6B6B',
  new: '#ccc',
};

const DATE_FILTERS = {
  all: 'Tất cả',
  today: 'Hôm nay',
  week: 'Tuần này',
};

const DoctorSchedule = () => {
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', dateRange: 'week' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingService.fetchDoctorSchedule(filter.dateRange);
      setWeekSchedule(res?.data?.weekSchedule || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [filter.dateRange]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const filterAppointments = (appointments) => {
    return appointments
      .filter(appt => filter.status === 'all' || appt.status === filter.status)
      .filter(appt => {
        if (filter.dateRange === 'today') {
          return new Date(appt.date).toDateString() === new Date().toDateString();
        }
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleSlotClick = (appt) => {
    setSelectedAppointment(appt);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  if (loading) return <p className="loading">Đang tải lịch hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="doctor-schedule">
      <h2>Lịch khám bác sĩ</h2>

      {/* Bộ lọc nhanh */}
      <div className="filter-quick">
        <div className="filter-group">
          <span>Trạng thái:</span>
          {Object.keys(STATUS_LABELS).map(key => (
            <button
              key={key}
              className={filter.status === key ? 'active' : ''}
              onClick={() => setFilter(prev => ({ ...prev, status: key }))}
            >
              {STATUS_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span>Ngày:</span>
          {Object.keys(DATE_FILTERS).map(key => (
            <button
              key={key}
              className={filter.dateRange === key ? 'active' : ''}
              onClick={() => setFilter(prev => ({ ...prev, dateRange: key }))}
            >
              {DATE_FILTERS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Lịch tuần */}
      <div className="weekly-schedule">
        {weekSchedule.map(day => {
          const dayDate = new Date(day.date);
          const filteredAppointments = filterAppointments(day.appointments || []);

          return (
            <div className="day-card" key={day.date}>
              <h4>{dayDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</h4>
              {filteredAppointments.length === 0 ? (
                <p>Chưa có lịch</p>
              ) : (
                <div className="slots">
                  {filteredAppointments.map(appt => (
                    <div
                      key={appt._id}
                      className="slot"
                      style={{ backgroundColor: STATUS_COLORS[appt.status || 'new'] }}
                      onClick={() => handleSlotClick(appt)}
                    >
                      {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.patient?.fullName || 'Chưa có tên'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal hiển thị chi tiết lịch hẹn */}
      {selectedAppointment && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h3>Chi tiết lịch hẹn</h3>
            <p><strong>Bệnh nhân:</strong> {selectedAppointment.patient?.fullName || 'Chưa có tên'}</p>
            <p><strong>Thời gian:</strong> {new Date(selectedAppointment.date).toLocaleString()}</p>
            <p><strong>Trạng thái:</strong> {STATUS_LABELS[selectedAppointment.status]}</p>
            <p><strong>Ghi chú:</strong> {selectedAppointment.notes || 'Không có ghi chú'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;

// import React, { useEffect, useState, useCallback } from 'react';
// import { bookingService } from '../../../services';
// import './DoctorSchedule.css';

// const STATUS_LABELS = {
//   all: 'Tất cả',
//   pending: 'Chờ xác nhận',
//   confirmed: 'Đã xác nhận',
//   cancelled: 'Đã hủy',
// };

// const STATUS_COLORS = {
//   pending: '#FFD966',
//   confirmed: '#59c2ff',
//   cancelled: '#FF6B6B',
//   new: '#ccc',
// };

// const DATE_FILTERS = {
//   all: 'Tất cả',
//   today: 'Hôm nay',
//   week: 'Tuần này',
// };

// const DoctorSchedule = () => {
//   const [weekSchedule, setWeekSchedule] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState({ status: 'all', dateRange: 'week' });

//   const loadSchedule = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await bookingService.fetchDoctorSchedule(filter.dateRange);
//       setWeekSchedule(res?.data?.weekSchedule || []);
//       setError(null);
//     } catch (err) {
//       console.error(err);
//       setError('Không thể tải lịch hẹn');
//     } finally {
//       setLoading(false);
//     }
//   }, [filter.dateRange]);

//   useEffect(() => {
//     loadSchedule();
//   }, [loadSchedule]);

//   const filterAppointments = (appointments) => {
//     return appointments
//       .filter(appt => filter.status === 'all' || appt.status === filter.status)
//       .filter(appt => {
//         if (filter.dateRange === 'today') {
//           return new Date(appt.date).toDateString() === new Date().toDateString();
//         }
//         return true;
//       })
//       .sort((a, b) => new Date(a.date) - new Date(b.date));
//   };

//   if (loading) return <p className="loading">Đang tải lịch hẹn...</p>;
//   if (error) return <p className="error">{error}</p>;

//   return (
//     <div className="doctor-schedule">
//       <h2>Lịch khám bác sĩ</h2>

//       {/* Bộ lọc nhanh */}
//       <div className="filter-quick">
//         <div className="filter-group">
//           <span>Trạng thái:</span>
//           {Object.keys(STATUS_LABELS).map(key => (
//             <button
//               key={key}
//               className={filter.status === key ? 'active' : ''}
//               onClick={() => setFilter(prev => ({ ...prev, status: key }))}
//             >
//               {STATUS_LABELS[key]}
//             </button>
//           ))}
//         </div>
//         <div className="filter-group">
//           <span>Ngày:</span>
//           {Object.keys(DATE_FILTERS).map(key => (
//             <button
//               key={key}
//               className={filter.dateRange === key ? 'active' : ''}
//               onClick={() => setFilter(prev => ({ ...prev, dateRange: key }))}
//             >
//               {DATE_FILTERS[key]}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Lịch tuần */}
//       <div className="weekly-schedule">
//         {weekSchedule.map(day => {
//           const dayDate = new Date(day.date);
//           const filteredAppointments = filterAppointments(day.appointments || []);

//           return (
//             <div className="day-card" key={day.date}>
//               <h4>{dayDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</h4>
//               {filteredAppointments.length === 0 ? (
//                 <p>Chưa có lịch</p>
//               ) : (
//                 <div className="slots">
//                   {filteredAppointments.map(appt => (
//                     <div
//                       key={appt._id}
//                       className="slot"
//                       style={{ backgroundColor: STATUS_COLORS[appt.status || 'new'] }}
//                     >
//                       {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.patient?.fullName || 'Chưa có tên'}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default DoctorSchedule;
