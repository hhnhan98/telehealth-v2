import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`/schedule/work-schedule?date=${date}`);
        setAppointments(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy lịch làm việc:', error);
      }
    };

    fetchAppointments();
  }, [date]);

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>📅 Lịch làm việc của tôi</h2>

      <label style={{ fontWeight: 'bold' }}>Chọn ngày:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ padding: 8, marginBottom: 16, display: 'block' }}
      />

      {appointments.length === 0 ? (
        <p>Không có lịch khám nào trong ngày.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Bệnh nhân</th>
              <th>Email</th>
              <th>Lý do khám</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const apptDate = new Date(appt.date);
              const time = apptDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Ho_Chi_Minh'
              });

              return (
                <tr key={appt._id}>
                  <td>{time}</td>
                  <td>{appt.patient?.fullName || 'Ẩn danh'}</td>
                  <td>{appt.patient?.email}</td>
                  <td>{appt.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DoctorSchedule;