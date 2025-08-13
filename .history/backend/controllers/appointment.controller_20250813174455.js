// src/pages/Patient/BookAppointment.jsx

/*
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const BookAppointment = () => {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Lấy danh sách chuyên khoa khi load trang
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await axiosInstance.get("/specialties");
        setSpecialties(res.data);
      } catch (error) {
        console.error("Lỗi khi tải chuyên khoa:", error);
      }
    };
    fetchSpecialties();
  }, []);

  // Lấy danh sách bác sĩ khi chọn chuyên khoa
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialty) return;
      try {
        const res = await axiosInstance.get(`/doctors/by-specialty/${selectedSpecialty}`);
        setDoctors(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bác sĩ:", error);
      }
    };
    fetchDoctors();
  }, [selectedSpecialty]);

  // Lấy khung giờ rảnh khi chọn bác sĩ & ngày
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/schedules/${selectedDoctor}`, {
          params: { date: selectedDate },
        });
        setAvailableSlots(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải khung giờ rảnh:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableSlots();
  }, [selectedDoctor, selectedDate]);

  // Gửi yêu cầu đặt lịch
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setMessage("Vui lòng chọn đầy đủ thông tin.");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post("/appointments", {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedSlot,
      });
      setMessage("✅ Đặt lịch thành công!");
      console.log("Kết quả đặt lịch:", res.data);
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      setMessage("❌ Lỗi khi đặt lịch. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Đặt lịch khám</h2>

      {/* Chọn chuyên khoa */}
      <label className="block mb-2 font-medium">Chuyên khoa</label>
      <select
        value={selectedSpecialty}
        onChange={(e) => setSelectedSpecialty(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Chọn chuyên khoa --</option>
        {specialties.map((sp) => (
          <option key={sp._id} value={sp._id}>
            {sp.name}
          </option>
        ))}
      </select>

      {/* Chọn bác sĩ */}
      <label className="block mb-2 font-medium">Bác sĩ</label>
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        disabled={!selectedSpecialty}
      >
        <option value="">-- Chọn bác sĩ --</option>
        {doctors.map((doc) => (
          <option key={doc._id} value={doc._id}>
            {doc.name}
          </option>
        ))}
      </select>

      {/* Chọn ngày */}
      <label className="block mb-2 font-medium">Ngày khám</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        disabled={!selectedDoctor}
      />

      {/* Chọn khung giờ */}
      <label className="block mb-2 font-medium">Khung giờ</label>
      {loading ? (
        <p>Đang tải khung giờ...</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSlot(slot)}
                className={`p-2 rounded border ${
                  selectedSlot === slot
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {slot}
              </button>
            ))
          ) : (
            <p>Không có khung giờ trống.</p>
          )}
        </div>
      )}

      {/* Nút đặt lịch */}
      <button
        onClick={handleBookAppointment}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Đang đặt..." : "Đặt lịch"}
      </button>

      {/* Thông báo */}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default BookAppointment;
