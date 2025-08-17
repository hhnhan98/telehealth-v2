import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const STATUS_COLORS = {
  pending: '#FFD966',
  confirmed: '#59C2FF',
  cancelled: '#FF6B6B',
  new: '#ccc'
};

const DoctorSchedule = () => {
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', dateRange: 'week' });

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/doctors/work-schedule?view=week');
        setWeekSchedule(res.data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải lịch hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) return <p className="loading">Đang tải lịch hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  // Flatten appointments & lọc
  const allAppointments = weekSchedule
    .flatMap(day => day.appointments)
    .filter(appt => {
      let match = true;
      if (filter.status !== 'all') match = appt.status === filter.status;

      if (filter.dateRange === 'today') {
        const today = new Date();
        match = match && new Date(appt.date).toDateString() === today.toDateString();
      }
      return match;
    })
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="doctor-schedule">
      <h2>Lịch khám bác sĩ</h2>

      {/* Bộ lọc nhanh */}
      <div className="filter-quick">
        <div>
          <label>Trạng thái:</label>
          {['all','pending','confirmed','cancelled'].map(s => (
            <button
              key={s}
              className={filter.status===s?'active':''}
              onClick={()=>setFilter({...filter,status:s})}
            >
              {s==='all'?'Tất cả': s==='pending'?'Chờ xác nhận': s==='confirmed'?'Đã xác nhận':'Đã hủy'}
            </button>
          ))}
        </div>
        <div>
          <label>Ngày:</label>
          {['all','today','week'].map(d => (
            <button
              key={d}
              className={filter.dateRange===d?'active':''}
              onClick={()=>setFilter({...filter,dateRange:d})}
            >
              {d==='all'?'Tất cả': d==='today'?'Hôm nay':'Tuần này'}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng lịch trực quan */}
      <div className="weekly-schedule">
        {weekSchedule.map(day => {
          const filteredSlots = day.appointments.filter(appt => 
            filter.status==='all' || appt.status===filter.status
          ).sort((a,b)=>new Date(a.date)-new Date(b.date));

          return (
            <div className="day-card" key={day.date}>
              <h4>{new Date(day.date).toLocaleDateString()}</h4>
              {filteredSlots.length===0 ? <p>Chưa có lịch</p> :
                <div className="slots">
                  {filteredSlots.map(appt => (
                    <div
                      key={appt._id}
                      className="slot"
                      style={{backgroundColor: STATUS_COLORS[appt.status||'new']}}
                    >
                      {new Date(appt.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - {appt.patient?.fullName || 'Chưa có tên'}
                    </div>
                  ))}
                </div>
              }
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default DoctorSchedule;
