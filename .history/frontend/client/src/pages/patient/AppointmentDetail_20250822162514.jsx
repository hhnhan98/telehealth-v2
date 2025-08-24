// src/pages/patient/AppointmentDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services';
import { ArrowLeft } from 'lucide-react';

const STATUS_LABELS = {
  pending: 'Chờ xác thực',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã khám',
};

const STATUS_CLASSES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const formatTime = (datetime) =>
  new Date(datetime).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    try {
      const res = await bookingService.getAppointmentById(id);
      setAppointment(res?.data || res);
    } catch (err) {
      console.error('Load detail error:', err.message || err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) return <p className="p-4">Đang tải chi tiết...</p>;
  if (!appointment) return <p className="p-4 text-red-600">Không tìm thấy lịch hẹn</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={18} className="mr-1" /> Quay lại
      </button>

      <h2 className="text-2xl font-semibold mb-6">Chi tiết lịch hẹn</h2>

      <div className="space-y-4">
        <div>
          <span className="font-medium text-gray-600">Thời gian:</span>{' '}
          <span>{formatTime(appointment.datetime)}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Cơ sở:</span>{' '}
          <span>{appointment.location?.name}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Chuyên khoa:</span>{' '}
          <span>{appointment.specialty?.name || '-'}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Bác sĩ:</span>{' '}
          <span>{appointment.doctor?.fullName || '-'}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Lý do khám:</span>{' '}
          <span>{appointment.reason || '-'}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Trạng thái:</span>{' '}
          <span
            className={`px-3 py-1 rounded-full text-sm ${STATUS_CLASSES[appointment.status]}`}
          >
            {STATUS_LABELS[appointment.status]}
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Mã lịch hẹn:</span>{' '}
          <span className="font-mono text-gray-800">{appointment._id}</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
