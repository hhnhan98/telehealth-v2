// src/pages/doctor/DoctorAppointmentDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function DoctorAppointmentDetail() {
  const { id } = useParams();
  console.log('Appointment ID từ params:', id);

  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Appointment ID từ params:', id);
        const token = localStorage.getItem('token');
        console.log('Token bác sĩ:', token);

        if (!token) throw new Error('Bạn chưa đăng nhập');

        const { data } = await axios.get(`/api/doctors/appointments/${apd}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Response từ API:', data);

        if (!data?.success || !data.data) {
          throw new Error(data?.message || 'Không tìm thấy cuộc hẹn');
        }

        setAppointment(data.data);
      } catch (err) {
        console.error('Lỗi khi tải thông tin appointment:', err);
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Đang tải thông tin cuộc hẹn...</p>;

  if (error)
    return (
      <div className="text-center mt-10 text-red-500">
        <p>{error}</p>
        <Button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Quay lại
        </Button>
      </div>
    );

  if (!appointment) return null;

  const patientName = appointment.patient?.fullName || appointment.patient?.user?.fullName || 'Không rõ';
  const doctorName = appointment.doctor?.fullName || appointment.doctor?.user?.fullName || 'Không rõ';

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Chi tiết cuộc hẹn</h2>
        <div className="space-y-2">
          <p><strong>Bệnh nhân:</strong> {patientName}</p>
          <p><strong>Bác sĩ:</strong> {doctorName}</p>
          <p><strong>Ngày/giờ:</strong> {appointment.date} {appointment.time}</p>
          <p><strong>Chuyên khoa:</strong> {appointment.specialty?.name || 'N/A'}</p>
          <p><strong>Cơ sở y tế:</strong> {appointment.location?.name || 'N/A'}</p>
          <p><strong>Lý do:</strong> {appointment.reason || 'Không có'}</p>
          <p><strong>Trạng thái:</strong> {appointment.status}</p>
        </div>
      </Card>

      {appointment.status !== 'completed' && (
        <Button
          onClick={() => navigate(`/doctor/appointments/${id}/medical-receipt`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tạo phiếu khám
        </Button>
      )}
    </div>
  );
}
