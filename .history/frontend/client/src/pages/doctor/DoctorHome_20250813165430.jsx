import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './DoctorHome.css';

const DoctorHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, weekRes] = await Promise.all([
          axios.get('/doctor-dashboard'),
          axios.get('/doctor-dashboard/weekly-schedule')
        ]);
        setDashboard(dashRes.data);
        setWeeklySchedule(weekRes.data);
        setError(null);
      } catch (err) {
        console.error(err.response || err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Đang tải dashboard...</p>;
  if (error) return <p className="error">{error}</p>;

  // Biểu đồ số lượng lượt khám trong tuần
  const chartData = weeklySchedule.map(day => ({
    date: day.date.toString().slice(0,10),
    booked: day.slots.filter(s => s !== null).length
  }));

  return (
    <div className="doctor-home">
      <h2>Dashboard bác sĩ</h2>

      <div className="cards">
        <div className="card">
          <h3>Lịch khám hôm nay</h3>
          <p>{dashboard.todayAppointments.length} lượt</p>
        </div>
        <div className="card">
          <h3>Tổng số bệnh nhân</h3>
          <p>{dashboard.totalPatients}</p>
        </div>
        <div className="card">
          <h3>Hồ sơ bệnh án mới (7 ngày)</h3>
          <p>{dashboard.recentRecordsCount}</p>
        </div>
      </div>

      <div className="chart-container">
        <h3>Lịch khám tuần</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="date"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="booked" fill="#82ca9d"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="appointments-list">
        <h3>Lịch khám hôm nay</h3>
        {dashboard.todayAppointments.length === 0 ? (
          <p>Chưa có lịch hôm nay</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.todayAppointments.map(appt => (
                <tr key={appt._id}>
                  <td>{new Date(appt.time).toLocaleTimeString()}</td>
                  <td>{appt.patient.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
