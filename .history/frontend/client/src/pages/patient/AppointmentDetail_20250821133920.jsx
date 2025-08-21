import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingService } from "../../services";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock4,
} from "lucide-react";

const STATUS_MAP = {
  pending: { label: "Chờ xác thực", icon: Clock4, color: "text-yellow-500" },
  confirmed: { label: "Đã xác nhận", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Đã hủy", icon: XCircle, color: "text-red-600" },
  completed: { label: "Hoàn tất", icon: CheckCircle, color: "text-blue-600" },
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await bookingService.getAppointmentById(id);
        if (res.success) setAppointment(res.data);
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết lịch hẹn:", err);
      }
    };
    fetchDetail();
  }, [id]);

  if (!appointment) {
    return (
      <div className="p-6 text-center text-gray-500">Đang tải chi tiết lịch hẹn...</div>
    );
  }

  const StatusIcon = STATUS_MAP[appointment.status]?.icon;
  const statusLabel = STATUS_MAP[appointment.status]?.label || "Không xác định";
  const statusColor = STATUS_MAP[appointment.status]?.color || "text-gray-600";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold">Chi tiết lịch hẹn</h2>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        {/* Trạng thái */}
        <div className="flex items-center gap-2">
          {StatusIcon && <StatusIcon className={`w-5 h-5 ${statusColor}`} />}
          <span className={`font-medium ${statusColor}`}>{statusLabel}</span>
        </div>

        {/* Ngày giờ */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>{new Date(appointment.date).toLocaleDateString("vi-VN")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>{appointment.time}</span>
        </div>

        {/* Bác sĩ */}
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-gray-500" />
          <span>Bác sĩ: {appointment.doctor?.name || "Chưa rõ"}</span>
        </div>

        {/* Cơ sở */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span>Cơ sở: {appointment.location?.name || "Không rõ"}</span>
        </div>

        {/* Lý do khám */}
        <div className="flex items-start gap-2">
          <FileText className="w-5 h-5 text-gray-500 mt-1" />
          <p>{appointment.reason || "Không có lý do được nhập"}</p>
        </div>
      </div>
    </div>
  );
}
