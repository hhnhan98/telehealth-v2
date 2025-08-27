// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import doctorService from '../../services/doctorService';
import './styles/DoctorDashboard.css';

dayjs.extend(utc);
dayjs.extend(timezone);
const DEFAULT_TZ = 'Asia/Ho_Chi_Minh';

const SLOT_TIMES = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30'
];

// Chuyển UTC sang giờ VN
const toVN = (utcDate) => dayjs(utcDate).tz(DEFAULT_TZ);

const DoctorDashboard = () => {
  const [dashboard, setDashboard] = useState({ todayAppointments: [], totalAppointments: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentsByDate, setAppointmentsByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ===== Load dashboard hôm nay =====
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

  // ===== Load appointments theo ngày =====
  const loadAppointmentsByDate = useCallback(async (date) => {
    try {
      if (!date) return setAppointmentsByDate([]);
      const formatted = dayjs(date).format('YYYY-MM-DD');
      const res = await doctorService.fetchAppointmentsByDate(formatted);
      if (res?.success && res.data?.appointments) {
        setAppointmentsByDate(res.data.appointments);
      } else {
        setAppointmentsByDate([]);
      }
    } catch (err) {
      console.error('Lỗi loadAppointmentsByDate:', err);
      setAppointmentsByDate([]);
    }
  }, []);

  useEffect(() => {
    loadAppointmentsByDate(selectedDate);
  }, [selectedDate, loadAppointmentsByDate]);

  // ===== Calendar controls =====
  const handlePrevDay = () => setSelectedDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  const handleNextDay = () => setSelectedDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));

  // ===== Click slot =====
  const handleClickSlot = (slot) => {
    if (slot.booked && slot.id) navigate(`/doctor/appointments/${slot.id}`);
  };

  // ===== Lấy slot cho ngày =====
  const getSlotsForDate = () => {
    if (!selectedDate) return SLOT_TIMES.map(time => ({ time, booked: false }));

    return SLOT_TIMES.map(time => {
      const [h, m] = time.split(':').map(Number);
      const appt = appointmentsByDate.find(a => {
        const apptVN = toVN(a.datetime);
        return apptVN.hour() === h && apptVN.minute() === m;
      });
      return {
        time,
        booked: !!appt,
        patient: appt?.patient?.fullName || 'Không rõ',
        id: appt?._id || null,
      };
    });
  };

  if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
  if (error) return (
    <div>
      <p>{error}</p>
      <button onClick={loadDashboard}>Thử lại</button>
    </div>
  );

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
              value={selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ''}
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
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`slot ${slot.booked ? 'booked' : 'free'}`}
              title={slot.booked ? `Bệnh nhân: ${slot.patient}` : 'Trống'}
              onClick={() => handleClickSlot(slot)}
            >
              {slot.time}
            </div>
          ))}
        </div>
      </div>

      {/* Card thống kê */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <h4>Tổng số lịch hẹn ngày chọn</h4>
          <p>{appointmentsByDate.length || 0}</p>
        </div>
        <div className="stat-card">
          <h4>Tổng số lịch hẹn hôm nay</h4>
          <p>{dashboard.totalAppointments || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
