import React, { useEffect, useState, useCallback } from 'react';
import scheduleService from '../../../services/scheduleService'; // Thay đổi ở đây
import './DoctorSchedule.css';

// Các hằng số và hàm khác...

const DoctorSchedule = () => {
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', dateRange: 'week' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.fetchDoctorSchedule(filter.dateRange); // Sử dụng scheduleService
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

  // Các phần còn lại của mã...
};

export default DoctorSchedule;
