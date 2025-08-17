import React, { useEffect, useState } from 'react';
import axios from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc nâng cao
  const [filter, setFilter] = useState({
    status: 'all', // all | pending | confirmed | cancelled
    dateRange: 'all', // all | today | week
  });

  // Lấy lịch hẹn
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = '/doctors/work-schedule?view=week';
      const res = await axios.get(url);
      setAppointments(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải lịch hẹn:', err.response || err);
      setError('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p className="loading">Đang tải lịch hẹn...</p>;
  if (error) return <p className="error">{error}</p>;

  // Flatten appointments từ tuần thành mảng
  let allAppointments = appointments.flatMap(day => day.appointments);

  // Bộ lọc nhanh
  const now = new Date();
  allAppointments = allAppointments.filter(appt => {
    let match = true;

    // lọc trạng thái
    if (filter.status !== 'all') match = appt.status === filter.status;

    // lọc ngày
    const apptDate = new Date(appt.date);
    if (filter.dateRange === 'today') {
      match = match && apptDate.toDateString() === now.toDateString();
    } else if (filter.dateRange === 'week') {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(now.getDate() + diffToMonday);
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      match = match && apptDate >= startOfWeek && apptDate <= endOfWeek;
    }

    return match;
  });

  // Sắp xếp theo thời gian tăng dần
  allAppointments.sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="doctor-schedule">
      <h2>Lịch khám bác sĩ</h2>

      {/* Bộ lọc nhanh */}
      <div className="filter-quick">
        <div>
          <label>Trạng thái:</label>
          <button className={filter.status==='all'?'active':''} onClick={()=>setFilter({...filter,status:'all'})}>Tất cả</button>
          <button className={filter.status==='pending'?'active':''} onClick={()=>setFilter({...filter,status:'pending'})}>Chờ xác nhận</button>
          <button className={filter.status==='confirmed'?'active':''} onClick={()=>setFilter({...filter,status:'confirmed'})}>Đã xác nhận</button>
          <button className={filter.status==='cancelled'?'active':''} onClick={()=>setFilter({...filter,status:'cancelled'})}>Đã hủy</button>
        </div>
        <div>
          <label>Ngày:</label>
          <button className={filter.dateRange==='all'?'active':''} onClick={()=>setFilter({...filter,dateRange:'all'})}>Tất cả</button>
          <button className={filter.dateRange==='today'?'active':''} onClick={()=>setFilter({...filter,dateRange:'today'})}>Hôm nay</button>
          <button className={filter.dateRange==='week'?'active':''} onClick={()=>setFilter({...filter,dateRange:'week'})}>Tuần này</button>
        </div>
      </div>

      {/* Bảng lịch hẹn */}
      {allAppointments.length === 0 ? (
        <p>Chưa có lịch hẹn nào phù hợp</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Bệnh nhân</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {allAppointments.map(appt => (
              <tr key={appt._id} className={`status-${appt.status || 'new'}`}>
                <td>{new Date(appt.date).toLocaleDateString()}</td>
                <td>{new Date(appt.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
                <td>{appt.patient?.fullName || 'Chưa có tên'}</td>
                <td>
                  {appt.status==='confirmed'?'Đã xác nhận':
                   appt.status==='cancelled'?'Đã hủy':'Mới'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorSchedule;
