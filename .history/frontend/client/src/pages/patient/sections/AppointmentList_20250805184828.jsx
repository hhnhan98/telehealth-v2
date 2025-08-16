import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axiosInstance.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await axiosInstance.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (error) {
      console.error('Lỗi khi huỷ lịch:', error);
    }
  };

  const applyQuickFilter = (type) => {
    setQuickFilter(type);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from = '';
    let to = '';

    switch (type) {
      case 'today':
        from = new Date(today);
        to = new Date(today);
        break;
      case 'thisWeek':
        from = new Date(today);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        to = endOfWeek;
        break;
      case 'next7Days':
        from = new Date(today);
        const next7 = new Date(today);
        next7.setDate(today.getDate() + 7);
        to = next7;
        break;
      case 'past':
        from = '';
        to = new Date(today);
        break;
      case 'all':
      default:
        from = '';
        to = '';
    }

    setFromDate(from ? from.toISOString().slice(0, 10) : '');
    setToDate(to ? to.toISOString().slice(0, 10) : '');
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesDoctor = appt.doctor?.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || appt.status === statusFilter;

    const apptDate = new Date(appt.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchesDate =
      (!from || apptDate >= from) &&
      (!to || apptDate <= new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1));

    return matchesDoctor && matchesStatus && matchesDate;
  });

  const translateStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return <span style={{ color: 'green' }}>Đã xác nhận</span>;
      case 'cancelled':
        return <span style={{ color: 'red' }}>Đã huỷ</span>;
      case 'pending':
        return 'Chờ xác nhận';
      default:
        return status;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Danh sách lịch hẹn</h2>

      {/* BỘ LỌC */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Tìm bác sĩ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* LỌC NHANH */}
      <div style={styles.quickFilters}>
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Hôm nay', value: 'today' },
          { label: 'Tuần này', value: 'thisWeek' },
          { label: '7 ngày tới', value: 'next7Days' },
          { label: 'Đã qua', value: 'past' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => applyQuickFilter(item.value)}
            style={{
              ...styles.quickButton,
              backgroundColor:
                quickFilter === item.value ? '#59c2ffff' : '#e5e7eb',
              color: quickFilter === item.value ? '#fff' : '#000',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* BẢNG DỮ LIỆU */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>STT</th>
            <th style={styles.th}>Ngày</th>
            <th style={styles.th}>Bác sĩ</th>
            <th style={styles.th}>Lý do</th>
            <th style={styles.th}>Trạng thái</th>
            <th style={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.length === 0 ? (
            <tr>
              <td colSpan="6" style={styles.td}>Không có lịch hẹn nào.</td>
            </tr>
          ) : (
            filteredAppointments.map((appt, index) => (
              <tr key={appt._id}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {new Date(appt.date).toLocaleString('vi-VN')}
                </td>
                <td style={styles.td}>
                  {appt.doctor?.fullName || 'Không rõ'}
                </td>
                <td style={styles.td}>{appt.reason || 'Không có'}</td>
                <td style={styles.td}>{translateStatus(appt.status)}</td>
                <td style={styles.td}>
                  {appt.status !== 'cancelled' ? (
                    <button
                      onClick={() => cancelAppointment(appt._id)}
                      style={styles.cancelButton}
                    >
                      Hủy lịch
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentList;

const styles = {
  container: { padding: '24px' },
  heading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  quickFilters: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  quickButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  select: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f3f4f6',
    textAlign: 'left',
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
  cancelButton: {
    padding: '6px 10px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};