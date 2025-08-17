import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [viewType, setViewType] = useState('day'); // 'day' hoặc 'week'
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  const doctorId = localStorage.getItem('userId'); // Giả sử lưu userId

  // Fetch lịch khám
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/appointments/doctor', {
        params: { view: viewType },
      });
      setAppointments(res.data.appointments || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy lịch khám:', err);
      setError('Không thể tải lịch khám');
    } finally {
      setLoading(false);
    }
  }, [viewType]);

  // Fetch slot trống
  const fetchAvailableSlots = useCallback(async () => {
    if (!doctorId || !viewDate) return;
    try {
      setLoadingSlots(true);
      const res = await axiosInstance.get(`/schedule/available/${doctorId}`, {
        params: { date: viewDate },
      });
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error('Lỗi khi lấy slot rảnh:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorId, viewDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  // Cập nhật trạng thái lịch hẹn
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/status`, { status });
      fetchAppointments(); // refresh dữ liệu
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  const handlePrevDay = () => {
    const prev = new Date(viewDate);
    prev.setDate(prev.getDate() - 1);
    setViewDate(prev.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 1);
    setViewDate(next.toISOString().slice(0, 10));
  };

  // Lọc appointments theo ngày hiện tại nếu viewType === 'day'
  const filteredAppointments =
    viewType === 'day'
      ? appointments.filter(appt => appt.date === viewDate)
      : appointments; // tuần: hiển thị tất cả

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Lịch làm việc của tôi</h2>
        <div className="view-buttons">
          <button
            onClick={() => setViewType('day')}
            className={viewType === 'day' ? 'active' : ''}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setViewType('week')}
            className={viewType === 'week' ? 'active' : ''}
          >
            Cả tuần
          </button>
        </div>
      </div>

      {viewType === 'day' && (
        <div className="date-navigation">
          <button onClick={handlePrevDay}>‹</button>
          <span>{new Date(viewDate).toLocaleDateString('vi-VN')}</span>
          <button onClick={handleNextDay}>›</button>
        </div>
      )}

      <div className="schedule-section">
        <h3>Lịch khám đã đặt</h3>
        {loading ? (
          <p>Đang tải lịch khám...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredAppointments.length === 0 ? (
          <p>Không có lịch khám nào.</p>
        ) : viewType === 'day' ? (
          <ul className="schedule-list">
            {filteredAppointments.map(appt => (
              <li key={appt._id} className="schedule-item">
                <strong>
                  {new Date(appt.time).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>{' '}
                - {appt.patient?.fullName || 'Bệnh nhân'} –{' '}
                {appt.patient?.reason || 'Không rõ lý do'}
                <div className="appointment-actions">
                  {appt.status !== 'confirmed' && (
                    <button
                      onClick={() =>
                        updateAppointmentStatus(appt._id, 'confirmed')
                      }
                    >
                      Xác nhận
                    </button>
                  )}
                  {appt.status !== 'cancelled' && (
                    <button
                      onClick={() =>
                        updateAppointmentStatus(appt._id, 'cancelled')
                      }
                    >
                      Hủy
                    </button>
                  )}
                </div>
                <p>Trạng thái: {appt.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appt => (
                <tr key={appt._id}>
                  <td>{new Date(appt.date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {new Date(appt.time).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{appt.patient?.fullName || 'Bệnh nhân'}</td>
                  <td>{appt.patient?.reason || 'Không rõ lý do'}</td>
                  <td>{appt.status}</td>
                  <td>
                    {appt.status !== 'confirmed' && (
                      <button
                        onClick={() =>
                          updateAppointmentStatus(appt._id, 'confirmed')
                        }
                      >
                        Xác nhận
                      </button>
                    )}
                    {appt.status !== 'cancelled' && (
                      <button
                        onClick={() =>
                          updateAppointmentStatus(appt._id, 'cancelled')
                        }
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="schedule-section">
        <h3>Slot trống</h3>
        {loadingSlots ? (
          <p>Đang tải slot trống...</p>
        ) : availableSlots.length === 0 ? (
          <p>Không còn slot rảnh trong ngày.</p>
        ) : (
          <ul className="schedule-list">
            {availableSlots.map(slot => (
              <li key={slot} className="schedule-slot">
                {slot}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
