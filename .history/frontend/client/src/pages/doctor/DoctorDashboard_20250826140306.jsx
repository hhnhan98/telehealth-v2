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

  // const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const DoctorDashboard = () => {
    const [dashboard, setDashboard] = useState({ todayAppointments: [], totalAppointments: 0 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const handlePrevDay = () => setSelectedDate(prev => new Date(prev.getTime() - 24*60*60*1000));
    const handleNextDay = () => setSelectedDate(prev => new Date(prev.getTime() + 24*60*60*1000));
    // const handleChangeDate = (e) => setSelectedDate(new Date(e.target.value));

    // const formatDate = (date) => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

    // ===== Lấy danh sách slot cho ngày =====
    const getSlotsForDate = () => {
      if (!selectedDate) return SLOT_TIMES.map(time => ({ time, booked: false }));

      return SLOT_TIMES.map(time => {
        const appt = dashboard.todayAppointments.find(a => {
          const apptDate = new Date(a.datetime);
          return apptDate.toDateString() === selectedDate.toDateString() &&
                apptDate.getHours() === parseInt(time.split(':')[0], 10) &&
                apptDate.getMinutes() === parseInt(time.split(':')[1], 10);
        });
        return { time, booked: !!appt, patient: appt?.patient?.fullName, id: appt?._id };
      });
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
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (!e.target.value) setSelectedDate(null);
                  else setSelectedDate(new Date(e.target.value));
                }}
              />
            </div>
            <button onClick={handleNextDay} className="btn-control">{'>'}</button>
          </div>

          {/* Slot Grid */}
          <div className="slot-grid">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`slot ${slot.booked ? 'booked' : 'free'}`}
                title={slot.booked ? `Bệnh nhân: ${slot.patient}` : 'Trống'}
                onClick={() => slot.booked && navigate(`/doctor/appointments/${slot.id}`)}
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
      </div>
    );
  };