import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Bạn chưa đăng nhập');

        const { data } = await axios.get(`/api/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAppointment(data.data);
      } catch (err) {
        console.error('Lỗi khi tải thông tin appointment:', err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Đang tải thông tin cuộc hẹn...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (!appointment) return null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Chi tiết cuộc hẹn</h2>
        <div className="space-y-2">
          <p><strong>Bệnh nhân:</strong> {appointment.patient.fullName}</p>
          <p><strong>Bác sĩ:</strong> {appointment.doctor.fullName}</p>
          <p><strong>Ngày/giờ:</strong> {appointment.date} {appointment.time}</p>
          <p><strong>Chuyên khoa:</strong> {appointment.specialty?.name || 'N/A'}</p>
          <p><strong>Cơ sở y tế:</strong> {appointment.location?.name || 'N/A'}</p>
          <p><strong>Lý do:</strong> {appointment.reason || 'Không có'}</p>
          <p><strong>Trạng thái:</strong> {appointment.status}</p>
        </div>
      </Card>

      {appointment.status !== 'completed' && (
        <Button
          onClick={() => navigate(`/doctor/appointments/${id}/medical-record`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tạo phiếu khám
        </Button>
      )}
    </div>
  );
}
