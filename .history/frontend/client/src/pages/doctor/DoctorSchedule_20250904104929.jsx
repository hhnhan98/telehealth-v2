import React, { useEffect, useState, useCallback } from "react";
import scheduleService from "../../services/scheduleService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CalendarX } from "lucide-react";

const STATUS_LABELS = {
  all: "Tất cả",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const STATUS_COLORS = {
  pending: "bg-yellow-400 text-black",
  confirmed: "bg-blue-500 text-white",
  cancelled: "bg-red-500 text-white",
  completed: "bg-green-500 text-white",
  new: "bg-gray-300 text-black",
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

  if (loading)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Đang tải lịch hẹn...</span>
      </div>
    );

  if (error)
    return (
      <p className="text-red-500 text-center font-medium mt-5">{error}</p>
    );

  return (
    <div className="doctor-schedule p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📅 Lịch khám bác sĩ</h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4">
        <div>
          <span className="font-medium mr-2">Trạng thái:</span>
          {Object.keys(STATUS_LABELS).map((key) => (
            <Button
              key={key}
              variant={filter.status === key ? "default" : "outline"}
              size="sm"
              className="mr-2"
              onClick={() => setFilter((prev) => ({ ...prev, status: key }))}
            >
              {STATUS_LABELS[key]}
            </Button>
          ))}
        </div>
        <div>
          <span className="font-medium mr-2">Ngày:</span>
          {Object.keys(DATE_FILTERS).map((key) => (
            <Button
              key={key}
              variant={filter.dateRange === key ? "default" : "outline"}
              size="sm"
              className="mr-2"
              onClick={() => setFilter((prev) => ({ ...prev, dateRange: key }))}
            >
              {DATE_FILTERS[key]}
            </Button>
          ))}
        </div>
      </div>

      {/* Lịch tuần */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weekSchedule.map((day) => {
          const dayDate = new Date(day.date);
          const filteredAppointments = filterAppointments(day.appointments || []);

          return (
            <Card key={day.date} className="shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle>
                  {dayDate.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="flex flex-col items-center text-gray-400 py-4">
                    <CalendarX className="h-10 w-10 mb-2" />
                    <span>Chưa có lịch</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAppointments.map((appt) => (
                      <div
                        key={appt._id}
                        onClick={() => setSelectedAppointment(appt)}
                        className={`p-3 rounded-xl cursor-pointer hover:shadow transition flex justify-between items-center ${STATUS_COLORS[appt.status || "new"]}`}
                      >
                        <span>
                          {new Date(appt.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>{appt.patient?.fullName || "Chưa có tên"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal chi tiết */}
      <Dialog open={!!selectedAppointment} onOpenChange={setSelectedAppointment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-3">
              <p>
                <strong>Bệnh nhân:</strong>{" "}
                {selectedAppointment.patient?.fullName || "Chưa có tên"}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedAppointment.date).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Badge className={STATUS_COLORS[selectedAppointment.status]}>
                  {STATUS_LABELS[selectedAppointment.status]}
                </Badge>
              </p>
              <p>
                <strong>Ghi chú:</strong>{" "}
                {selectedAppointment.notes || "Không có ghi chú"}
              </p>

              <div className="flex justify-end gap-3 pt-4">
                {selectedAppointment.status === "pending" && (
                  <Button
                    onClick={() => handleUpdateStatus("confirmed")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Xác nhận
                  </Button>
                )}
                {selectedAppointment.status !== "cancelled" && (
                  <Button
                    onClick={() => handleUpdateStatus("cancelled")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Hủy
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSchedule;
