import React, { useEffect, useState, useCallback } from "react";
import scheduleService from "../../services/scheduleService";
import Button from "../../components/ui/Button";
import { Card, Card }  from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
// import "../doctor/styles/WorkSchedule.css";

const STATUS_LABELS = {
  all: "Tất cả",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const STATUS_COLORS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  cancelled: "status-cancelled",
  completed: "status-completed",
  new: "status-new",
};

const DATE_FILTERS = {
  all: "Tất cả",
  today: "Hôm nay",
  week: "Tuần này",
};

const DoctorSchedule = () => {
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: "all", dateRange: "week" });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await scheduleService.fetchDoctorSchedule(filter.dateRange);
      setWeekSchedule(res?.data?.weekSchedule || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, [filter.dateRange]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const filterAppointments = (appointments) => {
    return appointments
      .filter((appt) => filter.status === "all" || appt.status === filter.status)
      .filter((appt) => {
        if (filter.dateRange === "today") {
          return new Date(appt.date).toDateString() === new Date().toDateString();
        }
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleUpdateStatus = async (status) => {
    if (selectedAppointment) {
      try {
        await scheduleService.updateAppointmentStatus(selectedAppointment._id, { status });
        loadSchedule();
        setSelectedAppointment(null);
      } catch (err) {
        console.error(err);
        setError("Không thể cập nhật trạng thái lịch hẹn");
      }
    }
  };

  return (
    <div className="doctor-schedule">
      <h2 className="page-title">📅 Lịch khám bác sĩ</h2>

      {/* Bộ lọc */}
      <div className="filters">
        <div className="filter-group">
          <span>Trạng thái:</span>
          {Object.keys(STATUS_LABELS).map((key) => (
            <Button
              key={key}
              variant={filter.status === key ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter((prev) => ({ ...prev, status: key }))}
            >
              {STATUS_LABELS[key]}
            </Button>
          ))}
        </div>
        <div className="filter-group">
          <span>Ngày:</span>
          {Object.keys(DATE_FILTERS).map((key) => (
            <Button
              key={key}
              variant={filter.dateRange === key ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter((prev) => ({ ...prev, dateRange: key }))}
            >
              {DATE_FILTERS[key]}
            </Button>
          ))}
        </div>
      </div>

      {/* Lịch tuần */}
      {loading ? (
        <p className="loading">Đang tải lịch hẹn...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="weekly-schedule">
          {weekSchedule.map((day) => {
            const dayDate = new Date(day.date);
            const filteredAppointments = filterAppointments(day.appointments || []);

            return (
              <Card key={day.date} className="day-card">
                <h4 className="day-title">
                  {dayDate.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  })}
                </h4>
                {filteredAppointments.length === 0 ? (
                  <p className="empty">Chưa có lịch</p>
                ) : (
                  <div className="slots">
                    {filteredAppointments.map((appt) => (
                      <div
                        key={appt._id}
                        className={`slot ${STATUS_COLORS[appt.status || "new"]}`}
                        onClick={() => setSelectedAppointment(appt)}
                      >
                        {new Date(appt.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {appt.patient?.fullName || "Chưa có tên"}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedAppointment && (
        <Modal onClose={() => setSelectedAppointment(null)}>
          <h3>Chi tiết lịch hẹn</h3>
          <p>
            <strong>Bệnh nhân:</strong> {selectedAppointment.patient?.fullName || "Chưa có tên"}
          </p>
          <p>
            <strong>Thời gian:</strong>{" "}
            {new Date(selectedAppointment.date).toLocaleString("vi-VN")}
          </p>
          <p>
            <strong>Trạng thái:</strong> {STATUS_LABELS[selectedAppointment.status]}
          </p>
          <p>
            <strong>Ghi chú:</strong> {selectedAppointment.notes || "Không có ghi chú"}
          </p>
          <div className="modal-actions">
            {selectedAppointment.status === "pending" && (
              <Button onClick={() => handleUpdateStatus("confirmed")} variant="primary">
                Xác nhận
              </Button>
            )}
            {selectedAppointment.status !== "cancelled" && (
              <Button onClick={() => handleUpdateStatus("cancelled")} variant="danger">
                Hủy
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
              Đóng
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorSchedule;
